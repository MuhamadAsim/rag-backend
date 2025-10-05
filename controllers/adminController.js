const User = require("../models/userModel.js");
const AdminFile = require("../models/adminFileModel.js");
const cloudinary = require("../config/cloudinary.js");
const path = require("path");
const axios = require("axios");


// ✅ GET all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET all admin files
const getAdminFiles = async (req, res) => {
  try {
    const files = await AdminFile.find().sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    console.error("Error fetching admin files:", err);
    res.status(500).json({ message: "Failed to fetch admin files" });
  }
};

// ✅ UPLOAD admin file
const uploadAdminFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const ext = path.extname(req.file.originalname);

    const newFile = new AdminFile({
      filename: req.file.originalname,
      url: req.file.path, // ✅ Cloudinary gives secure URL in .path
      publicId: req.file.filename, // ✅ filename = public_id from CloudinaryStorage
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user?.id || null,
    });

    const saved = await newFile.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({
      message: "Admin file upload failed",
      error: err.message,
    });
  }
};
const deleteAdminFile = async (req, res) => {
  try {
    const file = await AdminFile.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    // 🔹 Map mimetype to Cloudinary resource_type
    let resourceType = "raw"; // default fallback
    if (file.mimetype.startsWith("image/")) resourceType = "image";
    else if (file.mimetype.startsWith("video/")) resourceType = "video";

    await cloudinary.uploader.destroy(file.publicId, { resource_type: resourceType });

    await file.deleteOne();
    res.json({ message: "Admin file deleted" });
  } catch (err) {
    console.error("Delete failed:", err);
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};


// ✅ OPEN admin file in browser (redirects to Cloudinary URL)
const openAdminFile = async (req, res) => {
  try {
    const file = await AdminFile.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    res.redirect(file.url);
  } catch (err) {
    console.error("Error opening file:", err);
    res.status(500).json({ message: "Failed to open file", error: err.message });
  }
};



// ✅ DOWNLOAD file with correct name
const downloadAdminFile = async (req, res) => {
  try {
    const file = await AdminFile.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    const response = await axios.get(file.url, { responseType: "stream" });

    res.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);
    res.setHeader("Content-Type", file.mimetype);

    response.data.pipe(res);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ message: "Failed to download file", error: err.message });
  }
};


module.exports = {
  getAllUsers,
  getAdminFiles,
  uploadAdminFile,
  openAdminFile,
  deleteAdminFile,
  downloadAdminFile,
};
