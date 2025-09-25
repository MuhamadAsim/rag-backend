const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "myapp_uploads", // all uploads go here
    resource_type: "auto",   // auto-detect file type
  },
});

const upload = multer({ storage });

module.exports = upload;
