const User = require("../models/user");
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken")

//REGISTER CONTROLLER
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password, //i removed the hashing here because my userSchema model hook is already hashing the password before saving
      role,
      phone,
      address,
    });

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


//LOGIN CONTROLLER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password"); //.select("+password") tells mongoose to include password even though the user model set password to false on select
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



// USERS CAN UPDATE THEIR PROFILE (MAKE CHANGES TO USERNAME, PHONE AND ADDRESS)
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address },
      { new: true }
    ).select("-password");

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};