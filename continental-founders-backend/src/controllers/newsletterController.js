const { z } = require('zod');
const Subscriber = require('../models/Subscriber');

const subscribeSchema = z.object({
  email: z.string().email(),
  firstName: z.string().max(80).optional().default(''),
});

async function subscribe(req, res) {
  const { email, firstName } = subscribeSchema.parse(req.body);

  const existing = await Subscriber.findOne({ email: email.toLowerCase() });
  if (existing) {
    existing.active = true;
    if (firstName) existing.firstName = firstName;
    await existing.save();
    return res.json({ success: true, message: 'You are subscribed to Continental Founders updates.' });
  }

  await Subscriber.create({ email, firstName, source: 'website' });
  res.status(201).json({ success: true, message: 'You are subscribed to Continental Founders updates.' });
}

async function unsubscribe(req, res) {
  const schema = z.object({ email: z.string().email() });
  const { email } = schema.parse(req.body);
  await Subscriber.findOneAndUpdate({ email: email.toLowerCase() }, { active: false });
  res.json({ success: true, message: 'You have been unsubscribed.' });
}

async function listSubscribers(req, res) {
  const items = await Subscriber.find().sort({ createdAt: -1 });
  res.json({ success: true, items });
}

module.exports = { subscribe, unsubscribe, listSubscribers };
