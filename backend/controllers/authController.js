const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { secret } = require("../config/security");
const { profile } = require("../services/impact");
const cookieOptions = {
  httpOnly: true,
  sameSite: "strict",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 7 * 86400000,
};
function session(res, user) {
  res.cookie(
    "gc_session",
    jwt.sign({ id: user.id }, secret, { expiresIn: "7d", audience: "session" }),
    cookieOptions,
  );
}
const emailValue = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";
const registerUser = async (req, res) => {
  const { name, password } = req.body || {};
  const email = emailValue(req.body?.email);
  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.trim().length > 80 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    typeof password !== "string" ||
    password.length < 8 ||
    Buffer.byteLength(password) > 72
  ) {
    return res
      .status(400)
      .json({
        message: "Enter a name, valid email, and password of 8–72 bytes.",
      });
  }
  try {
    const user = await User.create({ name: name.trim(), email, password });
    session(res, user);
    res.status(201).json(await profile(user));
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    throw error;
  }
};
const loginUser = async (req, res) => {
  const { password } = req.body || {};
  if (typeof password !== "string" || Buffer.byteLength(password) > 72)
    return res
      .status(400)
      .json({ message: "Enter a valid email and password." });
  const user = await User.findOne({
    email: emailValue(req.body?.email),
  }).select("+password");
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: "Email or password is incorrect." });
  session(res, user);
  res.json(await profile(user));
};
const getMe = async (req, res) => res.json(await profile(req.user));
const logout = (req, res) => {
  res.clearCookie("gc_session", { ...cookieOptions, maxAge: undefined });
  res.json({ message: "Signed out" });
};
module.exports = { registerUser, loginUser, getMe, logout };
