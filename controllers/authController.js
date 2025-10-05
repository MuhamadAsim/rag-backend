// controllers/authController.js
const User = require("../models/userModel.js");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");


const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role || "user" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// SIGNUP
const signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (role === "admin") {
      return res
        .status(403)
        .json({ message: "Admin accounts cannot be created via signup" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = Date.now() + 1000 * 60 * 60; // 1 hour

    const newUser = new User({
      email,
      password,
      role: "user",
      verificationToken,
      verificationExpires,
    });

    await newUser.save();

    const verifyUrl = `${process.env.CLIENT_URL}/verified-success?token=${verificationToken}&email=${email}`;

    await sendEmail(
      email,
      "Verify your email",
      `Click the link to verify your account: ${verifyUrl}`
    );

    res.status(201).json({
      message: "Signup successful. Please check your email to verify your account.",
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// SIGNIN
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before signing in." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
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

// VERIFY EMAIL
const verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;

    const user = await User.findOne({
      email,
      verificationToken: token,
      verificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;

    await user.save();

    const jwtToken = generateToken(user);

    res.json({
      message: "Email verified successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        plan: user.plan,
        tokens: user.tokens,
        maxTokens: user.maxTokens,
      },
      token: jwtToken,
    });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found with this email" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${email}`;
    await sendEmail(email, "Reset Password", `Click to reset: ${resetLink}`);

    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- RESET PASSWORD --------------------
const resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired reset token" });

    user.password = newPassword; // let Mongoose hash it automatically
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { signup, signin, verifyEmail, forgotPassword, resetPassword };
