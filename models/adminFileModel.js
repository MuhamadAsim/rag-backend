const mongoose = require("mongoose");

const adminFileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },       // Cloudinary URL
    publicId: { type: String, required: true },  // Cloudinary public_id
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin user
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminFile", adminFileSchema);
