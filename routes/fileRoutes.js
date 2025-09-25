const express = require("express");
const upload = require("../middleware/uploadMiddleware.js");
const { getFiles, uploadFiles, deleteFile } = require("../controllers/fileController.js");

const router = express.Router();

router.get("/", getFiles);

router.post(
  "/upload",
  (req, res, next) => {
    console.log("➡️ Hitting /upload route");
    next();
  },
  upload.single("file"),
  (err, req, res, next) => {
    // Multer / Cloudinary errors land here
    console.error("❌ Multer error:", err);
    return res.status(400).json({ message: "Upload failed", error: err.message });
  },
  uploadFiles
);

router.delete("/:id", deleteFile);

module.exports = router;
