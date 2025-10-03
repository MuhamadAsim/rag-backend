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
    const { email, password, role } = req.body;

    // ❌ Prevent signup as admin
    if (role === "admin") {
      return res.status(403).json({ message: "Admin accounts cannot be created via signup" });
    }

    // check if user already exists (either admin or user)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // create new user (always role=user)
    const newUser = new User({ email, password, role: "user" });
    await newUser.save();

    // generate token
    const token = generateToken(newUser);

    res.status(201).json({
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        plan: newUser.plan,
        tokens: newUser.tokens,
        maxTokens: newUser.maxTokens,
      },
      token,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Signin user or admin
// @route   POST /api/auth/signin
// @access  Public
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 Look for user (either admin or normal user)
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
        role: user.role, // admin or user
        plan: user.plan,
        tokens: user.tokens,
        maxTokens: user.maxTokens,
      },
      token,
    });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { signup, signin };
