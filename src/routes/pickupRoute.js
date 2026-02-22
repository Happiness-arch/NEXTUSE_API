
// const express = require("express");
// const { protect } = require("../middleware/authZ");
// const Pickup = require("../models/pickup");

// const router = express.Router();

// const {
//   createPickup,
//   assignAgent,
//   markCollected,
//   approvePickup,
// } = require("../controllers/pickupCtrl");

// router.post("/", protect, createPickup);
// router.put("/:id/assign", protect, assignAgent);
// router.put("/:id/collect", protect, markCollected);
// router.put("/:id/approve", protect, approvePickup);


// module.exports = router;




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
} = require("../controllers/pickupCtrl");

const router = express.Router();

router.post("/", protect, authorize("household"), createPickup);
router.get("/my-pickups", protect, authorize("household"), getMyPickups);
router.get("/assigned", protect, authorize("driver"), getAssignedPickups);
router.get("/all", protect, authorize("admin"), getAllPickups);
router.put("/:id/assign", protect, authorize("admin"), assignDriver);
router.put("/:id/deliver", protect, authorize("driver"), markDelivered);
router.put("/:id/approve", protect, authorize("admin"), approvePickup);

module.exports = router;
