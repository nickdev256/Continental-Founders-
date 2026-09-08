const Contact = require('../models/Contact');
const Partnership = require('../models/Partnership');
const Subscriber = require('../models/Subscriber');

async function stats(req, res) {
  const [contacts, newContacts, partnerships, newPartnerships, subscribers] = await Promise.all([
    Contact.countDocuments(),
    Contact.countDocuments({ status: 'new' }),
    Partnership.countDocuments(),
    Partnership.countDocuments({ status: 'new' }),
    Subscriber.countDocuments({ active: true }),
  ]);

  res.json({
    success: true,
    stats: {
      contacts,
      newContacts,
      partnerships,
      newPartnerships,
      activeSubscribers: subscribers,
    },
  });
}

module.exports = { stats };
