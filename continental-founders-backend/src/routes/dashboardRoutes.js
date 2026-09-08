const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAdmin } = require('../middleware/auth');
const { stats } = require('../controllers/dashboardController');

const router = express.Router();
router.get('/stats', requireAdmin, asyncHandler(stats));
module.exports = router;
