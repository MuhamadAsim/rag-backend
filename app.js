const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");

const { notFound, errorHandler } = require("./middleware/errorMiddleware.js");

const authRoutes = require("./routes/authRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const fileRoutes = require("./routes/fileRoutes.js");

dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(morgan("dev"));  // Log requests
app.use(cors());         // Enable CORS

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/files", fileRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
