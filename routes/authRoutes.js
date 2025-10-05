// routes/auth.js
const express = require("express");
const { signup, signin, verifyEmail,forgotPassword,resetPassword } = require("../controllers/authController.js");

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/verify", verifyEmail); 
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
