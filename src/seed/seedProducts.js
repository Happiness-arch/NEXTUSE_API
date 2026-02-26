const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("../models/products");

const products = [
{ name: "2L PET Bottle", category: "plastic", ecoPoints: 25 },
  { name: "1L PET Bottle", category: "plastic", ecoPoints: 15 },
  { name: "500ml PET Bottle", category: "plastic", ecoPoints: 10 },
  { name: "330ml PET Bottle", category: "plastic", ecoPoints: 8 },

  { name: "1.5L HDPE Bottle/Jug", category: "plastic", ecoPoints: 22 },
  { name: "2L HDPE Bottle/Jug", category: "plastic", ecoPoints: 28 },

  { name: "Plastic Spoon", category: "plastic", ecoPoints: 2 },

  { name: "330ml Metal Drink Can", category: "metal", ecoPoints: 8 },
  { name: "170g Metal Can", category: "metal", ecoPoints: 6 },

  { name: "Egg carton (30 eggs)", category: "paper", ecoPoints: 20 },
  { name: "Large Cardboard box", category: "paper", ecoPoints: 30 },
  { name: "1L Milk/Juice Carton", category: "paper", ecoPoints: 18 },

  { name: "Wine Bottle", category: "glass", ecoPoints: 30 },
{ name: "Beer Bottle", category: "glass", ecoPoints: 20 },
{ name: "Glass Jar", category: "glass", ecoPoints: 15 },
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Optional: wipe & reseed (useful during dev)
    await Product.deleteMany({});
    await Product.insertMany(products);

    console.log("✅ Seeded products:", products.length);
    process.exit(0);
  } catch (e) {
    console.error("❌ Seed failed:", e.message);
    process.exit(1);
  }
}

run();