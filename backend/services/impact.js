const Trip = require("../models/Trip");
async function profile(user) {
  const [stats] = await Trip.aggregate([
    { $match: { user: user._id } },
    {
      $group: {
        _id: null,
        totalTrips: { $sum: 1 },
        co2Saved: { $sum: "$co2Saved" },
        ecoPoints: { $sum: "$ecoPoints" },
        days: {
          $addToSet: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "UTC",
            },
          },
        },
      },
    },
  ]);
  return {
    _id: user.id,
    name: user.name,
    email: user.email,
    totalTrips: stats?.totalTrips || 0,
    co2Saved: Number((stats?.co2Saved || 0).toFixed(2)),
    ecoPoints: stats?.ecoPoints || 0,
    daysActive: stats?.days.length || 0,
  };
}
module.exports = { profile };
