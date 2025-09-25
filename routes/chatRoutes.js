const express = require("express");
const {
  getChats,
  createChat,
  updateChat,
  deleteChat,
  replyChat,
} = require("../controllers/chatController.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.get("/", protect, getChats);
router.post("/", protect, createChat);
router.put("/:id", protect, updateChat);
router.delete("/:id", protect, deleteChat);
router.post("/reply", protect, replyChat);

module.exports = router;
