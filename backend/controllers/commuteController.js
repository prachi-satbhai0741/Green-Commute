// @desc    Calculate mock route options
// @route   POST /api/commute/calculate
// @access  Public
const calculateRoutes = async (req, res) => {
  try {
    const { source, destination } = req.body;

    if (!source || !destination) {
      return res.status(400).json({ message: 'Please provide both source and destination' });
    }

    // A simple mock hash to ensure deterministic results based on input strings
    const str = (source + destination).toLowerCase().trim();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use hash to generate somewhat "random" but consistent metrics
    const baseDistance = Math.max(2, Math.abs(hash % 20) + (Math.abs(hash % 10) / 10)); // e.g., 6.2 km
    const baseTime = Math.max(5, Math.floor(baseDistance * 3)); // approx 3 mins per km
    
    // Generate 3 Route Options based on the screenshots
    
    // 1. Fastest Route (Car/Taxi)
    const fastestRoute = {
      type: 'Fastest Route',
      score: 25,
      time: `${baseTime} min`,
      distance: `${(baseDistance + 0.3).toFixed(1)} km`,
      pollution: 'high',
      co2Saved: 0,
      recommended: false
    };

    // 2. Eco-Friendly Route (Public Transit + Short Walk)
    const ecoRoute = {
      type: 'Eco-Friendly Route',
      score: 80,
      time: `${baseTime * 2.5} min`,
      distance: `${baseDistance.toFixed(1)} km`,
      pollution: 'medium',
      co2Saved: (baseDistance * 0.12).toFixed(2), // e.g. 0.74 kg
      recommended: true
    };

    // 3. Best Green Route (Bicycle/Walk)
    const greenRoute = {
      type: 'Best Green Route',
      score: 95,
      time: `${baseTime * 6.5} min`,
      distance: `${(baseDistance * 0.8).toFixed(1)} km`,
      pollution: 'medium', // According to screenshot it said medium or low
      co2Saved: (baseDistance * 0.14).toFixed(2), // e.g. 0.86 kg
      recommended: false
    };

    res.status(200).json({
      source,
      destination,
      routes: [fastestRoute, ecoRoute, greenRoute]
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  calculateRoutes
};
