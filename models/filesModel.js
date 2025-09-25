const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filename: { type: String, required: true },
    url: { type: String, required: true },        // ✅ Cloudinary secure_url
    publicId: { type: String, required: true },   // ✅ Cloudinary public_id
    mimetype: { type: String },
    size: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", fileSchema);
