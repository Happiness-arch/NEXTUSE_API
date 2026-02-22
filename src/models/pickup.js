
const mongoose = require("mongoose");

const pickupSchema = new mongoose.Schema(
  {
    household: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    items: [
      {
        wasteType: {
        type: String,
        enum: ["plastic", "glass", "paper", "metal"],
        },
        weight: Number,
      },
    ],
    totalWeight: Number,
    status: {
      type: String,
      enum: ["pending", "assigned", "in_transit", "delivered", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pickup", pickupSchema);



