const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { secret } = require("../config/security");
const protect = async (req, res, next) => {
  const cookie = req.headers.cookie
    ?.split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith("gc_session="))
    ?.slice(11);
  const token =
    cookie || req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  try {
    const decoded = jwt.verify(token || "", secret, {
      algorithms: ["HS256"],
      audience: "session",
    });
    req.user = await User.findById(decoded.id);
    if (!req.user)
      return res.status(401).json({ message: "Please sign in again." });
  } catch {
    return res.status(401).json({ message: "Please sign in to continue." });
  }
  next();
};
module.exports = { protect };
