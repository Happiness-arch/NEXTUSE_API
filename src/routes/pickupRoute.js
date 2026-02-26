const express = require("express");
const { protect, authorize } = require("../middleware/authZ");
const {
  createPickup,
  assignDriver,
  markDelivered,
  approvePickup,
  getMyPickups,
  getAssignedPickups,
  getAllPickups,
  reschedulePickup
} = require("../controllers/pickupCtrl");

const router = express.Router();

router.post("/", protect, authorize("household"), createPickup);
router.get("/my-pickups", protect, authorize("household"), getMyPickups);
router.get("/assigned", protect, authorize("driver"), getAssignedPickups);
router.get("/all", protect, authorize("admin"), getAllPickups);
router.put("/:id/assign", protect, authorize("admin"), assignDriver);
router.put("/:id/deliver", protect, authorize("driver"), markDelivered);
router.put("/:id/approve", protect, authorize("admin"), approvePickup);
router.put("/:id/reschedule", protect, authorize("household"), reschedulePickup);

module.exports = router;