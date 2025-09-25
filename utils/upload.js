const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary.js");

console.log("⚙️ Setting up Cloudinary storage...");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    console.log("📂 Incoming file:", {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
    });

    return {
      folder: "chat-files", // Cloudinary folder
      resource_type: "auto", // allow pdf, word, excel, images, etc.
      public_id: `${Date.now()}-${file.originalname}`,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

module.exports = upload;
