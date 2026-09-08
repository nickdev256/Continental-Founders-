const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { login, me } = require('../controllers/authController');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.post('/login', asyncHandler(login));
router.get('/me', requireAdmin, asyncHandler(me));
module.exports = router;
