const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary.js");

console.log("⚙️ Setting up Cloudinary storage...");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = path.extname(file.originalname); // ✅ keep the extension
    const nameWithoutExt = path.parse(file.originalname).name;

    return {
      folder: "chat-files",
      resource_type: "raw", // handle any non-image files (PDF, TXT, DOCX, ZIP, etc)
      public_id: `${Date.now()}-${nameWithoutExt}${ext}`, // ✅ include extension
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      return cb(new Error("❌ Video uploads are not allowed"), false);
    }
    cb(null, true);
  },
});

module.exports = upload;
