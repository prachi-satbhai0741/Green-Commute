const mongoose = require("mongoose");
let memoryServer;
let connected = false;

async function connectDB() {
  // Reuse existing connection in serverless environments
  if (connected && mongoose.connection.readyState === 1) return;

  let uri = process.env.MONGODB_URI;
  if (!uri) {
    if (process.env.DEMO_MODE !== "true")
      throw new Error(
        "Set MONGODB_URI or explicitly enable temporary DEMO_MODE=true.",
      );
    // In serverless (Netlify), memory server won't persist between cold starts,
    // but it lets the app function for demo purposes.
    if (!memoryServer) {
      memoryServer =
        await require("mongodb-memory-server").MongoMemoryServer.create();
    }
    uri = memoryServer.getUri();
    console.warn(
      "DEMO MODE: accounts and trips are temporary and disappear when the server stops.",
    );
  }
  await mongoose.connect(uri);
  await Promise.all([
    require("../models/User").init(),
    require("../models/Trip").init(),
  ]);
  connected = true;
}

async function closeDB() {
  await mongoose.disconnect();
  connected = false;
  if (memoryServer) await memoryServer.stop();
}

module.exports = { connectDB, closeDB };
