const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    firstName: { type: String, trim: true, default: '' },
    active: { type: Boolean, default: true },
    source: { type: String, trim: true, default: 'website' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscriber', subscriberSchema);
