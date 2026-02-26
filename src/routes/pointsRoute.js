const express = require("express");
const { protect, authorize } = require("../middleware/authZ");
const { getPointsHistory } = require("../controllers/pointsCtrl");

const router = express.Router();

router.get("/history", protect, authorize("household"), getPointsHistory);

module.exports = router;