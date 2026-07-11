require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { pool } = require('./db');

const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const purchaseRoutes = require('./routes/purchases');
const sellRoutes = require('./routes/sell');
const offerRoutes = require('./routes/offers');
const adminRoutes = require('./routes/admin');
const inquiryRoutes = require('./routes/inquiries');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '5mb' }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/sell', sellRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inquiries', inquiryRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected', error: err.message });
  }
});

// Stats (public)
app.get('/api/stats', async (req, res) => {
  try {
    const [vehicles, sold, customers] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM vehicles WHERE status = 'available'"),
      pool.query("SELECT COUNT(*) FROM vehicles WHERE status = 'sold'"),
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'customer'")
    ]);
    res.json({
      available: parseInt(vehicles.rows[0].count),
      sold: parseInt(sold.rows[0].count),
      customers: parseInt(customers.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`DriveX API running on port ${PORT}`);
});

module.exports = app;
