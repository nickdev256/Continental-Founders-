const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const partnershipRoutes = require('./routes/partnershipRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((url) => url.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again shortly.' },
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Continental Founders API is running',
    environment: process.env.NODE_ENV || 'development',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/contact', publicFormLimiter, contactRoutes);
app.use('/api/partnerships', publicFormLimiter, partnershipRoutes);
app.use('/api/newsletter', publicFormLimiter, newsletterRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
