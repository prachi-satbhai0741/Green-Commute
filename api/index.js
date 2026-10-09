const app = require("../backend/app");
const { connectDB } = require("../backend/config/db");

let dbReady = false;

module.exports = async (req, res) => {
  if (!dbReady) {
    try {
      await connectDB();
      dbReady = true;
    } catch (err) {
      console.error("DB Connection Error:", err);
    }
  }
  return app(req, res);
};
