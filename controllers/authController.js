// controllers/authController.js
const User = require("../models/userModel.js");
const jwt = require("jsonwebtoken");

// helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role || "user" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// @desc    Signup user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    console.log("Signup request body:", req.body);
    const { email, password } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // create new user
    const newUser = new User({ email, password });
    await newUser.save();

    // generate token
    const token = generateToken(newUser);

    res.status(201).json({
      user: {
        id: newUser._id,
        email: newUser.email,
        plan: newUser.plan,
      },
      token,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Signin user
// @route   POST /api/auth/signin
// @access  Public
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // generate token
    const token = generateToken(user);

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        plan: user.plan,
        role: "basic",
        tokens: 1000,
      },
      token,
    });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { signup, signin };
