const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false, //hides password from queries by default
    },
    phone: {
      type: String,
      unique:true,
      sparse: true,
    },
    address: {
      type: String,
    },
    role: {
      type: String,
      enum: ["household", "driver", "admin"],
      default: "household",
    },
    points: {
      type: Number,
      default: 0,
    },
    wallet: {
      type: Number,
      default: 0,
    },

  },
  { timestamps: true }
);

//PRE-SAVE HOOK HASHES plain-text PASSWORD AUTOMATICALLY BEFORE IT IS SAVED IN DB SO NO NEED FOR MANUAL HASHING
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("User", userSchema);