const File = require("../models/filesModel.js");
const cloudinary = require("../config/cloudinary.js");
const axios = require("axios");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { Pinecone } = require("@pinecone-database/pinecone");
const OpenAI = require("openai");

// GET all files for a user
const getFiles = async (req, res) => {
  try {
    console.log("➡️ GET /api/files", req.query);

    const { userId } = req.query;
    if (!userId) {
      console.warn("⚠️ No userId in query");
      return res.status(400).json({ message: "userId is required" });
    }

    const files = await File.find({ userId }).sort({ createdAt: -1 });
    console.log(`✅ Found ${files.length} files for user ${userId}`);

    res.json(files);
  } catch (error) {
    console.error("❌ getFiles error:", error);
    res.status(500).json({ message: "Failed to fetch files" });
  }
};










// UPLOAD file
const uploadFiles = async (req, res) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  console.log("📤 Uploaded file info:", req.file);


  function splitIntoChunks(text, maxWords = 500) {
    const words = text.split(/\s+/);
    const chunks = [];
    for (let i = 0; i < words.length; i += maxWords) {
      chunks.push(words.slice(i, i + maxWords).join(" "));
    }
    return chunks;
  }

  console.log("➡️ POST /api/files/upload");

  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Save metadata to MongoDB
    const newFile = new File({
      userId,
      filename: req.file.originalname,
      url: req.file.path,           // <-- use path, not secure_url
      publicId: req.file.filename,  // <-- or req.file.public_id
      mimetype: req.file.mimetype,
      size: req.file.size,
    });


    const savedFile = await newFile.save();
    console.log("✅ File saved to DB:", savedFile._id);

    // Download file from Cloudinary (buffer)
    const response = await axios.get(req.file.path, {
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(response.data);

    // Extract text
    let fileTextPages = [];
    if (req.file.mimetype.includes("pdf")) {
      const pdfData = await pdfParse(buffer);
      fileTextPages = pdfData.text.split(/\f/);
    } else if (
      req.file.mimetype.includes("word") ||
      req.file.mimetype.includes("docx")
    ) {
      const result = await mammoth.extractRawText({ buffer });
      fileTextPages = result.value.split(/\n\n/);
    } else {
      console.warn("⚠️ Unsupported file type for text extraction");
    }


    // Build vectors
    const vectors = [];
    for (let pageIndex = 0; pageIndex < fileTextPages.length; pageIndex++) {
      const pageText = fileTextPages[pageIndex];
      const chunks = splitIntoChunks(pageText, 500);

      for (let i = 0; i < chunks.length; i++) {
        const emb = await openai.embeddings.create({
          model: "text-embedding-3-large",
          input: chunks[i],
        });

        vectors.push({
          id: `${savedFile._id}-p${pageIndex + 1}-c${i}`,
          values: emb.data[0].embedding,
          metadata: {
            fileId: savedFile._id.toString(),
            filename: savedFile.filename,
            page: pageIndex + 1,
            chunk: i,
            text: chunks[i],
          },
        });
      }
    }

    // Upload to Pinecone
    const index = pc.index("my-index");
    await index.upsert(vectors);
    console.log(`📤 Uploaded ${vectors.length} vectors to Pinecone`);

    res.status(201).json({
      file: savedFile,
      vectorsStored: vectors.length,
    });
  } catch (error) {
    console.error("❌ uploadFiles error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};














// DELETE file
const deleteFile = async (req, res) => {
  console.log("➡️ DELETE /api/files/:id", req.params);
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      console.warn("⚠️ File not found:", req.params.id);
      return res.status(404).json({ message: "File not found" });
    }

    console.log("🗑 Deleting file from Cloudinary:", file.publicId);
    await cloudinary.uploader.destroy(file.publicId, { resource_type: "auto" });

    console.log("🗑 Deleting file from DB:", file._id);
    await file.deleteOne();

    console.log("✅ File deleted successfully");
    res.json({ message: "File deleted" });
  } catch (error) {
    console.error("❌ deleteFile error:", error);
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

module.exports = {
  getFiles,
  uploadFiles,
  deleteFile,
};
