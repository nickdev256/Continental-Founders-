const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAdmin } = require('../middleware/auth');
const { subscribe, unsubscribe, listSubscribers } = require('../controllers/newsletterController');

const router = express.Router();
router.post('/subscribe', asyncHandler(subscribe));
router.post('/unsubscribe', asyncHandler(unsubscribe));
router.get('/', requireAdmin, asyncHandler(listSubscribers));
module.exports = router;
