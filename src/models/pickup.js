
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
        // wasteType: {
        // type: String,
        // enum: ["plastic", "glass", "paper", "metal"],
        // },
        // weight: Number,
        product: { type: ObjectId, ref: "Product" },
        quantity: Number
      },
    ],
    // totalWeight: Number,
    // status: {
    //   type: String,
    //   enum: ["pending", "assigned", "in_transit", "delivered", "completed"],
    //   default: "pending",
    // },


    //NEW LOGIC
    // totalEcoPoints = Σ(quantity × product.ecoPoints),
//        scheduledDate: Date,
//       timeSlot: String,
//       status: {
//       type: String,
//       enum: ["draft", "requested", "confirmed", "completed"]
// },


  },
  { timestamps: true }
);

module.exports = mongoose.model("Pickup", pickupSchema);



