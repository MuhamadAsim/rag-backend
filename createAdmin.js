const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/userModel");

const MONGO_URI = "mongodb://localhost:27017/mydatabase"; // change db name

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    const email = "a@gmail.com";
    const password = "123456";
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new User({
      email,
      password: hashedPassword,
      role: "admin",
      plan: "premium",
    });

    await admin.save();
    console.log("✅ Admin created:", admin);
    mongoose.disconnect();
  } catch (err) {
    console.error("Error creating admin:", err);
  }
};

createAdmin();
