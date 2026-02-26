const Inventory = require("../models/inventory");
const Product = require("../models/products");

function computeInventoryStats(inventoryDoc) {
  let totalEcoPoints = 0;
  const categoryTotals = {};

  for (const item of inventoryDoc.items) {
    const product = item.product;
    if (!product) continue;

    const qty = Number(item.quantity || 0);
    const ep = Number(product.ecoPoints || 0);
    const cat = product.category || "unknown";

    const itemEcoPoints = qty * ep;
    totalEcoPoints += itemEcoPoints;

    if (!categoryTotals[cat]) categoryTotals[cat] = { quantity: 0, ecoPoints: 0 };
    categoryTotals[cat].quantity += qty;
    categoryTotals[cat].ecoPoints += itemEcoPoints;
  }

  return { totalEcoPoints, categoryTotals };
}

// ADD ITEM TO INVENTORY
exports.addWaste = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }
    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({ message: "quantity must be > 0" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let inventory = await Inventory.findOne({ user: req.user.id });
    if (!inventory) {
      inventory = await Inventory.create({ user: req.user.id, items: [] });
    }

    const existing = inventory.items.find((it) => it.product.toString() === productId);

    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      inventory.items.push({ product: productId, quantity: Number(quantity) });
    }

    await inventory.save();

    const populated = await Inventory.findById(inventory._id).populate("items.product");
    const { totalEcoPoints, categoryTotals } = computeInventoryStats(populated);

    return res.status(200).json({
      message: "Item logged",
      ...populated.toObject(), // keeps items at root
      totalEcoPoints,
      categoryTotals,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
// REMOVE ITEM FROM INVENTORY
exports.removeItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const inventory = await Inventory.findOne({ user: req.user.id });
    if (!inventory) return res.status(404).json({ message: "Inventory not found" });

    inventory.items = inventory.items.filter(
      (item) => item.product.toString() !== productId
    );

    await inventory.save();

    const populated = await Inventory.findById(inventory._id).populate("items.product");
    const { totalEcoPoints, categoryTotals } = computeInventoryStats(populated);

    return res.status(200).json({
      message: "Item removed",
      ...populated.toObject(),
      totalEcoPoints,
      categoryTotals,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET MY INVENTORY
exports.getMyInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findOne({ user: req.user.id }).populate("items.product");

    if (!inventory) {
      return res.status(404).json({ message: "No inventory found" });
    }

    const { totalEcoPoints, categoryTotals } = computeInventoryStats(inventory);

    return res.status(200).json({
      ...inventory.toObject(), // keeps items at root
      totalEcoPoints,
      categoryTotals,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};