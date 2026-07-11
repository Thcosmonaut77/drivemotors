const express = require('express');
const { query } = require('../db');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', optionalAuth, async (req, res) => {
  try {
    const { vehicleId, name, email, phone, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'Name, email, and message required' });

    const result = await query(
      'INSERT INTO inquiries (user_id, vehicle_id, name, email, phone, message) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user?.id || null, vehicleId || null, name, email, phone || null, message]
    );
    res.status(201).json({ message: 'Inquiry submitted successfully', id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
});

module.exports = router;
