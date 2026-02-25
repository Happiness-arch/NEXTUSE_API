
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const rateLimit = require("express-rate-limit");

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


app.use("/api/auth/login", loginLimiter);

const authRoute = require("./src/routes/authRoute")
app.use("/api/auth", authRoute);


const pickupRoutes = require("./src/routes/pickupRoute");
app.use("/api/pickups", pickupRoutes);


const inventoryRoutes = require("./src/routes/inventoryRoute");
app.use("/api/inventory", inventoryRoutes);

const { protect, authorize } = require("./src/middleware/authZ");


const redeemRoutes = require("./src/routes/redeemRoute");
app.use("/api/redeem", redeemRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'NEXTUSE API running' });
});

const ecobotRoutes = require("./src/routes/ecobotRoute");
app.use("/api/ecobot", ecobotRoutes);


module.exports = app;
