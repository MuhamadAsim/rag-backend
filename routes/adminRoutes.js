const express = require("express");
const upload = require("../middleware/uploadMiddleware.js");
const { getAllUsers } = require("../controllers/adminController.js");
const { protect } = require("../middleware/authMiddleware.js");
const {
  getAdminFiles,
  uploadAdminFile,
  deleteAdminFile,
  openAdminFile,
  downloadAdminFile,

} = require("../controllers/adminController.js");

const router = express.Router();

// GET /api/admin/users
router.get("/users",protect, getAllUsers);
router.get("/", getAdminFiles);
router.post("/upload", upload.single("file"), uploadAdminFile);
router.delete("/files/:id", deleteAdminFile);
router.get("/:id/open", openAdminFile);
router.get("/:id/download", downloadAdminFile);

module.exports = router;
