

const express = require("express");
const { protect, authorize } = require("../middleware/authZ");
const { addWaste, getMyInventory } = require("../controllers/inventoryCtrl");

const router = express.Router();

router.post("/add", protect, authorize("household"), addWaste);
router.get("/me", protect, authorize("household"), getMyInventory);

module.exports = router;



