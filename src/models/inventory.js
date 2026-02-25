const mongoose = require("mongoose");

// const itemSchema = new mongoose.Schema({
//   wasteType: {
//   type: String,
//     enum: ["plastic", "glass", "paper", "metal"],
//     required: true,
//   },
//   weight: {
//     type: Number,
//   required: true,
//   },
// });


const itemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const inventorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
    },
    items: [itemSchema],
    totalWeight: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);
