const { Pinecone } = require("@pinecone-database/pinecone");

let pinecone;

const connectPinecone = async () => {
  try {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error("PINECONE_API_KEY not set in .env");
    }

    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    console.log("✅ Pinecone client initialized");
    return pinecone;
  } catch (error) {
    console.error("❌ Pinecone connection failed:", error.message);
    process.exit(1);
  }
};

const getPinecone = () => {
  if (!pinecone) {
    throw new Error("Pinecone not initialized. Call connectPinecone first.");
  }
  return pinecone;
};

module.exports = { connectPinecone, getPinecone };
