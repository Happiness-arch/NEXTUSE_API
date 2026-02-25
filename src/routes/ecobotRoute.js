const express = require("express");
const { protect } = require("../middleware/authZ");
const { chat, getTips } = require("../controllers/ecobotCtrl");

const router = express.Router();

router.post("/chat", protect, chat);
router.post("/chat", protect, chat);
router.get("/tips", protect, getTips);

module.exports = router;

module.exports = router;