const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAdmin } = require('../middleware/auth');
const { createPartnership, listPartnerships, updatePartnershipStatus } = require('../controllers/partnershipController');

const router = express.Router();
router.post('/', asyncHandler(createPartnership));
router.get('/', requireAdmin, asyncHandler(listPartnerships));
router.patch('/:id/status', requireAdmin, asyncHandler(updatePartnershipStatus));
module.exports = router;
