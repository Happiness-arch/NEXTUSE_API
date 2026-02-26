const express = require("express");
const { register, login, updateProfile } = require("../controllers/authCtrl");
const { protect, authorize } = require("../middleware/authZ");
const User = require ("../models/user")

const router = express.Router();


//CREATE DATA
router.post("/register", register);
router.post("/login", login);

router.post("/create-staff", protect, authorize("admin"), async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    if (!["driver", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be driver or admin" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      name, email, password, role, phone, address
    });

    res.status(201).json({ message: `${role} created successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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



//FETCH DATA
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

//UPDATE DATA
router.put("/update-profile", protect, updateProfile);




module.exports = router;
