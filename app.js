const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { protect, authorize } = require("./src/middleware/authZ");


const ecobotRoutes = require("./src/routes/ecobotRoute");
const authRoute = require("./src/routes/authRoute");
const pickupRoutes = require("./src/routes/pickupRoute");
const inventoryRoutes = require("./src/routes/inventoryRoute");
const redeemRoutes = require("./src/routes/redeemRoute");
const productRoutes = require("./src/routes/productRoute");
const pointsRoutes = require("./src/routes/pointsRoute");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "NEXTUSE API running" });
});

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // max 3 login attempts per 5 minutes
  message: { message: "Too many login attempts, please try again after 15 minutes" },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 requests per 15 minutes per IP
  message: { message: "Too many requests, please slow down" },
});


app.use(generalLimiter);
app.use("/api/ecobot", ecobotRoutes);
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth", authRoute);
app.use("/api/pickups", pickupRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/redeem", redeemRoutes);
app.use("/api/products", productRoutes);
app.use("/api/points", pointsRoutes);


module.exports = app;
