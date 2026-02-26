const express = require("express");
const { protect } = require("../middleware/authZ");
const { listProducts } = require("../controllers/productCtrl");

const router = express.Router();

router.get("/", protect, listProducts);

module.exports = router;