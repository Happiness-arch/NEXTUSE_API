const Pickup = require("../models/pickup");
const Inventory = require("../models/inventory");
const User = require("../models/user");
const PointsLog = require("../models/pointsLog");
const Product = require("../models/products");

// helper to compute ecoPoints from [{product, quantity}]
async function computeEcoPoints(items) {
  const ids = items.map((i) => i.product);
  const products = await Product.find({ _id: { $in: ids } });

  const map = new Map(products.map((p) => [p._id.toString(), Number(p.ecoPoints || 0)]));

  let total = 0;
  for (const i of items) {
    total += Number(i.quantity || 0) * (map.get(i.product.toString()) || 0);
  }
  return total;
}

// CREATE PICKUP (household) — from current inventory
exports.createPickup = async (req, res) => {
  try {
    const { scheduledDate, timeSlot } = req.body;

    if (!scheduledDate) return res.status(400).json({ message: "scheduledDate is required" });
    if (!timeSlot) return res.status(400).json({ message: "timeSlot is required" });

    // prevent multiple active pickups
    const existingPending = await Pickup.findOne({
      household: req.user.id,
      status: { $in: ["pending", "assigned"] },
    });
    if (existingPending) {
      return res.status(400).json({
        message: "You already have an active pickup. Please wait for completion.",
      });
    }

    const inventory = await Inventory.findOne({ user: req.user.id });

    if (!inventory || !inventory.items || inventory.items.length === 0) {
      return res.status(404).json({ message: "No inventory items to request pickup" });
    }

    const estimatedEcoPoints = await computeEcoPoints(inventory.items);

    if (estimatedEcoPoints < 5000) {
  return res.status(400).json({
    message: `Minimum 5000 EcoPoints required. Your inventory is worth ${estimatedEcoPoints} EcoPoints`,
  });
}

    const pickup = await Pickup.create({
      household: req.user.id,
      items: inventory.items,
      scheduledDate,
      timeSlot,
      estimatedEcoPoints,
      status: "pending",
    });

    const populated = await Pickup.findById(pickup._id)
      .populate("items.product")
      .populate("household", "name email phone address")
      .populate("driver", "name email phone");

    return res.status(201).json({ message: "Pickup created", pickup: populated });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ASSIGN DRIVER (admin)
exports.assignDriver = async (req, res) => {
  try {
    const { driverId } = req.body;
    if (!driverId) return res.status(400).json({ message: "driverId is required" });

    const driver = await User.findById(driverId);
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    if (driver.role !== "driver") {
      return res.status(400).json({ message: "Selected user is not a driver" });
    }

    const pickup = await Pickup.findById(req.params.id);
    if (!pickup) return res.status(404).json({ message: "Pickup not found" });

    if (pickup.status !== "pending") {
      return res.status(400).json({ message: "Pickup is not pending" });
    }

    pickup.driver = driverId;
    pickup.status = "assigned";
    await pickup.save();

    const populated = await Pickup.findById(pickup._id)
      .populate("items.product")
      .populate("driver", "name email phone")
      .populate("household", "name email phone address");

    return res.status(200).json({ message: "Driver assigned", pickup: populated });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DRIVER MARKS DELIVERED
exports.markDelivered = async (req, res) => {
  try {
    const pickup = await Pickup.findById(req.params.id);
    if (!pickup) return res.status(404).json({ message: "Pickup not found" });

    if (pickup.status !== "assigned") {
      return res.status(400).json({ message: "Pickup is not assigned yet" });
    }

    if (!pickup.driver || pickup.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    pickup.status = "delivered";
    await pickup.save();

    const populated = await Pickup.findById(pickup._id)
      .populate("items.product")
      .populate("household", "name email phone address")
      .populate("driver", "name email phone");

    return res.status(200).json({ message: "Pickup marked delivered", pickup: populated });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ADMIN APPROVES AND AWARDS POINTS + CLEARS INVENTORY
exports.approvePickup = async (req, res) => {
  try {
    const pickup = await Pickup.findById(req.params.id);
    if (!pickup) return res.status(404).json({ message: "Pickup not found" });

    if (pickup.status === "completed") {
      return res.status(400).json({ message: "Pickup already completed" });
    }

    if (pickup.status !== "delivered") {
      return res.status(400).json({ message: "Pickup not delivered yet" });
    }

    const totalPoints = Number(pickup.estimatedEcoPoints || 0);

    const household = await User.findById(pickup.household);
    if (!household) return res.status(404).json({ message: "Household not found" });

    household.points = Number(household.points || 0) + totalPoints;
    await household.save();

    await PointsLog.create({
      user: household._id,
      pickup: pickup._id,
      pointsAwarded: totalPoints,
    });

    // MVP behavior: clear inventory after completion
    await Inventory.findOneAndUpdate(
      { user: pickup.household },
      { $set: { items: [] } }
    );

    pickup.status = "completed";
    await pickup.save();

    return res.status(200).json({
      message: "Pickup approved and rewards distributed",
      pointsAwarded: totalPoints,
      household: {
        name: household.name,
        totalPoints: household.points,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// HOUSEHOLD VIEWS THEIR PICKUP HISTORY
exports.getMyPickups = async (req, res) => {
  try {
    const pickups = await Pickup.find({ household: req.user.id })
      .populate("household", "name email phone address")
      .populate("driver", "name email phone")
      .populate("items.product")
      .sort({ createdAt: -1 });

    return res.status(200).json(pickups);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DRIVER VIEWS ASSIGNED PICKUPS
exports.getAssignedPickups = async (req, res) => {
  try {
    const pickups = await Pickup.find({ driver: req.user.id })
      .populate("household", "name email phone address")
      .populate("items.product")
      .sort({ createdAt: -1 });

    return res.status(200).json(pickups);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ADMIN VIEWS ALL PICKUPS
exports.getAllPickups = async (req, res) => {
  try {
    const pickups = await Pickup.find()
      .populate("household", "name email phone address")
      .populate("driver", "name email phone")
      .populate("items.product")
      .sort({ createdAt: -1 });

    return res.status(200).json(pickups);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//RESCHEDULE PICKUP
exports.reschedulePickup = async (req, res) => {
  try {
    const { scheduledDate, timeSlot } = req.body;
    
    const pickup = await Pickup.findById(req.params.id);
    if (!pickup) return res.status(404).json({ message: "Pickup not found" });
    
    if (!["pending", "assigned"].includes(pickup.status)) {
      return res.status(400).json({ message: "Cannot reschedule this pickup" });
    }

    if (pickup.household.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    pickup.scheduledDate = scheduledDate || pickup.scheduledDate;
    pickup.timeSlot = timeSlot || pickup.timeSlot;
    await pickup.save();

    return res.status(200).json({ message: "Pickup rescheduled", pickup });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};