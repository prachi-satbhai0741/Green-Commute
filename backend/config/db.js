const mongoose = require("mongoose");
let memoryServer;
let connected = false;

async function connectDB() {
  // Reuse existing connection in serverless environments
  if (connected && mongoose.connection.readyState === 1) return;

  let uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("MONGODB_URI is not set. Database operations will be disabled or fallback in demo mode.");
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      // On Vercel / serverless production, don't launch memory server child processes
      return;
    }
    try {
      if (!memoryServer) {
        memoryServer = await require("mongodb-memory-server").MongoMemoryServer.create();
      }
      uri = memoryServer.getUri();
    } catch (e) {
      console.warn("Could not start MongoMemoryServer:", e.message);
      return;
    }
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    await Promise.all([
      require("../models/User").init().catch(() => {}),
      require("../models/Trip").init().catch(() => {}),
    ]);
    connected = true;
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
  }
}

async function closeDB() {
  await mongoose.disconnect();
  connected = false;
  if (memoryServer) await memoryServer.stop();
}

module.exports = { connectDB, closeDB };
