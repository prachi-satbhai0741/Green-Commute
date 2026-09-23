const jwt = require("jsonwebtoken");
const { randomUUID } = require("node:crypto");
const { secret } = require("../config/security");
const { options, roadDistance } = require("../services/routing");
const calculateRoutes = async (req, res) => {
  let { source, destination, distanceKm } = req.body || {};
  if (
    typeof source !== "string" ||
    typeof destination !== "string" ||
    !source.trim() ||
    !destination.trim() ||
    source.length > 200 ||
    destination.length > 200 ||
    source.trim().toLowerCase() === destination.trim().toLowerCase()
  )
    return res
      .status(400)
      .json({
        message: "Enter two different locations, up to 200 characters each.",
      });
  source = source.trim();
  destination = destination.trim();
  let drivingMinutes,
    basis = "manual";
  if (distanceKm !== undefined) {
    if (
      typeof distanceKm !== "number" ||
      !Number.isFinite(distanceKm) ||
      distanceKm < 0.1 ||
      distanceKm > 500
    )
      return res
        .status(400)
        .json({ message: "Distance must be between 0.1 and 500 km." });
  } else {
    try {
      ({ source, destination, distanceKm, drivingMinutes } = await roadDistance(
        source,
        destination,
      ));
      basis = "road";
    } catch (error) {
      return res.status(503).json({ message: error.message });
    }
  }
  const routes = options(distanceKm, drivingMinutes);
  const quote = jwt.sign(
    {
      userId: req.user.id,
      quoteId: randomUUID(),
      source,
      destination,
      basis,
      routes,
    },
    secret,
    { expiresIn: "2h", audience: "route" },
  );
  res.json({ source, destination, basis, routes, quote });
};
module.exports = { calculateRoutes };
