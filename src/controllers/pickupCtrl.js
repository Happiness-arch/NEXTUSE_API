
//NEW ARCHITECTURE 
const Pickup = require("../models/pickup");
const Inventory = require("../models/inventory");
const User = require("../models/user");
const PointsLog = require("../models/pointsLog");



//CREATE PICKUP
exports.createPickup = async (req, res) => {
  try{
  const inventory = await Inventory.findOne({ user: req.user.id });

  if (!inventory)
  return res.status(404).json({ message: "No inventory found" });

if (inventory.totalWeight < 5)
  return res.status(400).json({ message: "Minimum 5kg required to request pickup" });


  const pickup = await Pickup.create({
    household: req.user.id,
    items: inventory.items,
    totalWeight: inventory.totalWeight,
  });

  // Reset inventory
  inventory.items = [];
  inventory.totalWeight = 0;
  await inventory.save();

  res.status(201).json(pickup);
} catch (error) {
  console.error(error);
  res.status(500).json({message: error.message});
}

};



//ASSIGN DRIVER
exports.assignDriver = async (req, res) => {
  try {
    const { driverId } = req.body;

    const pickup = await Pickup.findById(req.params.id);
    if (!pickup)
      return res.status(404).json({ message: "Pickup not found" });

    if (pickup.status !== "pending")
  return res.status(400).json({ message: "Pickup is not pending" });

    pickup.driver = driverId;
    pickup.status = "assigned";

    await pickup.save();

    res.json(pickup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

//DRIVER MARKS DELIVERED AND UPDATES WEIGHT
exports.markDelivered = async (req, res) => {
  try {
    const { items } = req.body;

    const pickup = await Pickup.findById(req.params.id);
    if (!pickup)
      return res.status(404).json({ message: "Pickup not found" });

    if (pickup.status !== "assigned")
      return res.status(400).json({ message: "Pickup is not assigned yet" });

    // Update items with actual weights from driver
    pickup.items = items;

    // Calculate total weight from actual items
    pickup.totalWeight = items.reduce((sum, item) => sum + item.weight, 0);

    pickup.status = "delivered";
    await pickup.save();

    res.json(pickup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};



//ADMIN APPROVES AND AWARDS POINT
exports.approvePickup = async (req, res) => {
  try {
    const pickup = await Pickup.findById(req.params.id);
    if (!pickup)
      return res.status(404).json({ message: "Pickup not found" });

    if (pickup.status !== "delivered")
      return res.status(400).json({ message: "Pickup not delivered yet" });

    // Points per kg per waste type
    const pointsRate = {
      plastic: 5,
      glass: 4,
      paper: 3,
      metal: 8,
    };

    // Calculate points per item
    let totalPoints = 0;
    for (const item of pickup.items) {
      const rate = pointsRate[item.wasteType] || 0;
      totalPoints += item.weight * rate;
    }

    // Driver earns ₦100 per kg
    const driverEarnings = pickup.totalWeight * 100;

    // Update household points
    const household = await User.findById(pickup.household);
    household.points += totalPoints;
    await household.save();

    // Update driver earnings
    const driver = await User.findById(pickup.driver);
    driver.earnings += driverEarnings;
    await driver.save();

    // Log points
    await PointsLog.create({
      user: household._id,
      pickup: pickup._id,
      pointsAwarded: totalPoints,
    });

    // Complete the pickup
    pickup.status = "completed";
    await pickup.save();

    res.json({
      message: "Pickup approved and rewards distributed",
      pointsAwarded: totalPoints,
      driverEarnings: driverEarnings,
      household: {
        name: household.name,
        totalPoints: household.points,
      },
      driver: {
        name: driver.name,
        totalEarnings: driver.earnings,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};



// HOUSEHOLD VIEWS THEIR PICKUP HISTORY
exports.getMyPickups = async (req, res) => {
  try {
    const pickups = await Pickup.find({ household: req.user.id })
      .populate("driver", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json(pickups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// DRIVER VIEWS ASSIGNED PICKUPS
exports.getAssignedPickups = async (req, res) => {
  try {
    const pickups = await Pickup.find({ driver: req.user.id })
      .populate("household", "name email phone address")
      .sort({ createdAt: -1 });

    res.status(200).json(pickups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ADMIN VIEWS ALL PICKUPS
exports.getAllPickups = async (req, res) => {
  try {
    const pickups = await Pickup.find()
      .populate("household", "name email phone address")
      .populate("driver", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json(pickups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};