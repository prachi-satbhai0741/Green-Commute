const express = require('express');
const router = express.Router();
const { calculateRoutes } = require('../controllers/commuteController');

router.post('/calculate', calculateRoutes);

module.exports = router;
