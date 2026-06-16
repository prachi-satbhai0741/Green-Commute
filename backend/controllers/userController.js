const User = require('../models/User');

// @desc    Update user stats after selecting a route
// @route   POST /api/user/select-route
// @access  Private
const selectRoute = async (req, res) => {
  try {
    const { co2Saved } = req.body; // e.g. 0.74

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update stats
    user.totalTrips += 1;
    user.co2Saved += parseFloat(co2Saved || 0);
    
    // Eco points: 10 points per 0.1kg CO2 saved, + 10 base points for taking a trip
    const earnedPoints = 10 + Math.floor(parseFloat(co2Saved || 0) * 100);
    user.ecoPoints += earnedPoints;

    await user.save();

    res.status(200).json({
      totalTrips: user.totalTrips,
      co2Saved: user.co2Saved.toFixed(2),
      ecoPoints: user.ecoPoints,
      daysActive: user.daysActive
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  selectRoute
};
