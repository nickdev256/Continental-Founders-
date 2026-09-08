const { z } = require('zod');
const Partnership = require('../models/Partnership');
const sendEmail = require('../utils/sendEmail');

const partnershipSchema = z.object({
  organization: z.string().min(2).max(180),
  contactName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional().default(''),
  organizationType: z.string().max(120).optional().default(''),
  website: z.string().max(250).optional().default(''),
  areaOfInterest: z.string().max(180).optional().default(''),
  message: z.string().max(5000).optional().default(''),
});

async function createPartnership(req, res) {
  const data = partnershipSchema.parse(req.body);
  const partnership = await Partnership.create(data);

  sendEmail({
    subject: `New partnership inquiry: ${data.organization}`,
    replyTo: data.email,
    html: `
      <h2>New Partnership Inquiry</h2>
      <p><strong>Organization:</strong> ${safe(data.organization)}</p>
      <p><strong>Contact:</strong> ${safe(data.contactName)}</p>
      <p><strong>Email:</strong> ${safe(data.email)}</p>
      <p><strong>Phone:</strong> ${safe(data.phone || 'Not provided')}</p>
      <p><strong>Type:</strong> ${safe(data.organizationType || 'Not provided')}</p>
      <p><strong>Website:</strong> ${safe(data.website || 'Not provided')}</p>
      <p><strong>Area of interest:</strong> ${safe(data.areaOfInterest || 'Not provided')}</p>
      <p><strong>Message:</strong></p>
      <p>${safe(data.message || 'No additional message').replace(/\n/g, '<br>')}</p>
    `,
  }).catch((error) => console.error('Email notification failed:', error.message));

  res.status(201).json({
    success: true,
    message: 'Your partnership inquiry has been submitted.',
    id: partnership._id,
  });
}

async function listPartnerships(req, res) {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { status } : {};
  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const [items, total] = await Promise.all([
    Partnership.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    Partnership.countDocuments(filter),
  ]);

  res.json({ success: true, items, pagination: { page: pageNum, limit: limitNum, total } });
}

async function updatePartnershipStatus(req, res) {
  const schema = z.object({
    status: z.enum(['new', 'reviewing', 'contacted', 'approved', 'declined']),
  });
  const { status } = schema.parse(req.body);
  const item = await Partnership.findByIdAndUpdate(req.params.id, { status }, { new: true });

  if (!item) return res.status(404).json({ success: false, message: 'Partnership inquiry not found.' });
  res.json({ success: true, item });
}

function safe(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = { createPartnership, listPartnerships, updatePartnershipStatus };
