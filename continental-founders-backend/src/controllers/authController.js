const jwt = require('jsonwebtoken');
const { z } = require('zod');
const Admin = require('../models/Admin');

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function createToken(admin) {
  return jwt.sign(
    { sub: admin._id.toString(), role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

async function login(req, res) {
  const { email, password } = loginSchema.parse(req.body);
  const admin = await Admin.findOne({ email: email.toLowerCase() });

  if (!admin || !(await admin.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  res.json({
    success: true,
    token: createToken(admin),
    admin: admin.toSafeObject(),
  });
}

async function me(req, res) {
  res.json({ success: true, admin: req.admin.toSafeObject() });
}

module.exports = { login, me };
