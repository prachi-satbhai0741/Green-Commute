const jwt = require("jsonwebtoken");
const { secret } = require("../config/security");
const Trip = require("../models/Trip");
const { profile } = require("../services/impact");
const selectRoute = async (req, res) => {
  let quote;
  try {
    quote = jwt.verify(req.body?.quote || "", secret, {
      algorithms: ["HS256"],
      audience: "route",
    });
  } catch {
    return res
      .status(400)
      .json({ message: "This comparison expired. Please calculate again." });
  }
  const route = quote.routes.find((r) => r.mode === req.body.mode);
  if (quote.userId !== req.user.id || !route)
    return res.status(400).json({ message: "Invalid trip selection." });
  try {
    await Trip.create({
      user: req.user._id,
      quoteId: quote.quoteId,
      source: quote.source,
      destination: quote.destination,
      basis: quote.basis,
      ...route,
      ecoPoints: Math.round(route.co2Saved * 100),
    });
  } catch (error) {
    if (error.code !== 11000) throw error;
    return res
      .status(409)
      .json({ message: "This journey has already been logged." });
  }
  res.status(201).json(await profile(req.user));
};
const history = async (req, res) =>
  res.json(
    await Trip.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .select("-user -quoteId -__v")
      .lean(),
  );
const removeTrip = async (req, res) => {
  if (!/^[a-f0-9]{24}$/i.test(req.params.id))
    return res.status(400).json({ message: "Invalid trip ID." });
  const removed = await Trip.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!removed) return res.status(404).json({ message: "Trip not found." });
  res.json(await profile(req.user));
};
module.exports = { selectRoute, history, removeTrip };
