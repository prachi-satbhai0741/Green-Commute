const crypto = require("node:crypto");

// In production, JWT_SECRET must be set. In dev/demo, auto-generate one.
const secret =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production"
    ? (() => {
        console.warn(
          "WARNING: JWT_SECRET not set. Generating a random secret. Sessions will not persist across function restarts.",
        );
        return crypto.randomBytes(48).toString("hex");
      })()
    : crypto.randomBytes(48).toString("hex"));

module.exports = { secret };
