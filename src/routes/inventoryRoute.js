const express = require("express");
const { protect } = require("../middleware/authZ");
const { addWaste, getMyInventory, removeItem } = require("../controllers/inventoryCtrl");

const router = express.Router();

router.post("/add", protect, addWaste);
router.get("/me", protect, getMyInventory);
router.delete("/item/:productId", protect, removeItem);


module.exports = router;