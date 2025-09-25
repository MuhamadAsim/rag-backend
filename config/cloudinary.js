// config/cloudinary.js
const { v2: cloudinary } = require("cloudinary");
const dotenv = require("dotenv");

dotenv.config(); // load .env here too (in case app.js loads it after)

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
