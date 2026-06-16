const express = require('express');
const router = express.Router();
const { selectRoute } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.post('/select-route', protect, selectRoute);

module.exports = router;
