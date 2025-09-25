// controllers/chatController.js
const Chat = require("../models/chatModel.js");

const mapChat = (chat) => {
  const obj = chat.toObject();

  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;

  // ✅ Properly preserve the role field for each message
  obj.messages = (obj.messages || []).map((msg) => ({
    id: msg._id.toString(),
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp,
  }));

  return obj;
};

const getChats = async (req, res) => {
  try {
    const { userId } = req.query;
    const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });
    res.json(chats.map(mapChat));
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const createChat = async (req, res) => {
  try {
    const chat = new Chat({
      userId: req.body.userId,
      messages: [],
      title: "New Chat",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await chat.save();
    res.json(mapChat(chat));
  } catch (err) {
    console.error("Error creating chat:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateChat = async (req, res) => {
  try {
    console.log("Updating chat with data:", req.body);
    const updated = await Chat.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Chat not found" });
    res.json(mapChat(updated));
  } catch (err) {
    console.error("Error updating chat:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteChat = async (req, res) => {
  try {
    const deleted = await Chat.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Chat not found" });
    res.json({ message: "Chat deleted", id: req.params.id });
  } catch (err) {
    console.error("Error deleting chat:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const replyChat = async (req, res) => {
  try {
    const { chatId, userId, message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    let chat;

    if (!chatId) {
      // 🆕 First message → create new chat
      chat = new Chat({
        userId,
        title: message.substring(0, 50).trim(),
        messages: [
          {
            role: "user",
            content: message,
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      // ✏️ Existing chat
      chat = await Chat.findById(chatId);
      if (!chat) return res.status(404).json({ message: "Chat not found" });

      // Add user message
      chat.messages.push({
        role: "user",
        content: message,
        timestamp: new Date(),
      });
      chat.updatedAt = new Date();
    }

    // Add AI response
    const aiMessage = {
      role: "assistant",
      content: `Fake AI response to: "${message}"`,
      timestamp: new Date(),
    };

    chat.messages.push(aiMessage);
    chat.updatedAt = new Date();

    await chat.save();

    // Debug logs
    console.log("Chat before mapping:", JSON.stringify(chat.messages.slice(-2), null, 2));

    const mappedChat = mapChat(chat);

    console.log("Chat after mapping:", JSON.stringify(mappedChat.messages.slice(-2), null, 2));

    res.json(mappedChat);
  } catch (err) {
    console.error("Error in replyChat:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getChats,
  createChat,
  updateChat,
  deleteChat,
  replyChat,
};
