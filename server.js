require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

app.use(express.static(path.join(__dirname, 'public')));

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

app.get('/api/vehicles', asyncHandler((req, res) => {
  const { category, featured } = req.query;
  const db = getDb();

  let sql = 'SELECT * FROM vehicles WHERE 1=1';
  const params = [];

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (featured !== undefined) {
    sql += ' AND featured = ?';
    params.push(featured === 'true' || featured === '1' ? 1 : 0);
  }

  sql += ' ORDER BY price ASC';

  const vehicles = db.prepare(sql).all(...params);
  res.json({ success: true, data: vehicles });
}));

app.get('/api/vehicles/:id', asyncHandler((req, res) => {
  const db = getDb();
  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id);

  if (!vehicle) {
    return res.status(404).json({ success: false, error: 'Vehicle not found' });
  }

  res.json({ success: true, data: vehicle });
}));

app.post('/api/contact', asyncHandler((req, res) => {
  const { name, email, message } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Name is required' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'A valid email is required' });
  }
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }

  const db = getDb();
  const id = uuidv4();
  db.prepare(
    'INSERT INTO contacts (id, name, email, message) VALUES (?, ?, ?, ?)'
  ).run(id, name.trim(), email.trim().toLowerCase(), message.trim());

  res.status(201).json({ success: true, data: { id } });
}));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log('DriveX Motors API running on http://localhost:%d', PORT);
});
