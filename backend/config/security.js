const crypto = require("node:crypto");
if (
  process.env.NODE_ENV === "production" &&
  (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
) {
  throw new Error(
    "Set JWT_SECRET to at least 32 random characters in production",
  );
}
module.exports = {
  secret: process.env.JWT_SECRET || crypto.randomBytes(48).toString("hex"),
};
