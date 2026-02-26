const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const inventorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    items: [itemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);