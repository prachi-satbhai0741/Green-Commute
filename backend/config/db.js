const mongoose = require("mongoose");
let memoryServer;
async function connectDB() {
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    if (
      process.env.NODE_ENV === "production" ||
      process.env.DEMO_MODE !== "true"
    )
      throw new Error(
        "Set MONGODB_URI or explicitly enable temporary DEMO_MODE=true.",
      );
    memoryServer =
      await require("mongodb-memory-server").MongoMemoryServer.create();
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
}
async function closeDB() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}
module.exports = { connectDB, closeDB };
