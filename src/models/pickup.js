const mongoose = require("mongoose");

const pickupItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const pickupSchema = new mongoose.Schema(
  {
    household: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    items: { type: [pickupItemSchema], default: [] },

    scheduledDate: { type: Date, required: true },
    timeSlot: { type: String, required: true },

    estimatedEcoPoints: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["pending", "assigned", "delivered", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pickup", pickupSchema);