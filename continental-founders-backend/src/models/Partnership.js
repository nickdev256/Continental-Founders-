const mongoose = require('mongoose');

const partnershipSchema = new mongoose.Schema(
  {
    organization: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    organizationType: { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' },
    areaOfInterest: { type: String, trim: true, default: '' },
    message: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['new', 'reviewing', 'contacted', 'approved', 'declined'],
      default: 'new',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Partnership', partnershipSchema);
