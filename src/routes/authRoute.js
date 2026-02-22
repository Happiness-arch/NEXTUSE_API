const express = require("express");
const { register, login, updateProfile } = require("../controllers/authCtrl");
const { protect, authorize } = require("../middleware/authZ");
const User = require ("../models/user")

const router = express.Router();

router.post("/register", register);
router.post("/login", login);



router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});


router.get("/test", (req, res) => {
  res.json({ message: "Auth route working" });
});


// Admin only can see ALL users info, password excluded
router.get("/all-users", protect, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }

});


router.put("/update-profile", protect, updateProfile);




module.exports = router;
