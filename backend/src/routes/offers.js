const express = require('express');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Make an offer
router.post('/', authenticate, async (req, res) => {
  try {
    const { vehicleId, offerAmount, message } = req.body;
    if (!vehicleId || !offerAmount) return res.status(400).json({ error: 'Vehicle ID and offer amount required' });
    if (offerAmount <= 0) return res.status(400).json({ error: 'Offer must be greater than 0' });

    const vehicle = await query("SELECT * FROM vehicles WHERE id = $1 AND status = 'available'", [vehicleId]);
    if (vehicle.rows.length === 0) return res.status(404).json({ error: 'Vehicle not available' });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const result = await query(
      `INSERT INTO offers (user_id, vehicle_id, offer_amount, message, expires_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, vehicleId, offerAmount, message || null, expiresAt]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit offer' });
  }
});

// Get my offers
router.get('/my', authenticate, async (req, res) => {
  try {
    const result = await query(`
      SELECT o.*, v.title, v.make, v.model, v.year, v.image_url, v.price as listed_price
      FROM offers o JOIN vehicles v ON o.vehicle_id = v.id
      WHERE o.user_id = $1 ORDER BY o.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

// Get offers for a vehicle (seller/admin)
router.get('/vehicle/:vehicleId', authenticate, async (req, res) => {
  try {
    const result = await query(`
      SELECT o.*, u.first_name, u.last_name, u.email
      FROM offers o JOIN users u ON o.user_id = u.id
      WHERE o.vehicle_id = $1 ORDER BY o.created_at DESC
    `, [req.params.vehicleId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicle offers' });
  }
});

// Respond to offer (counter/accept/reject)
router.put('/:id/respond', authenticate, async (req, res) => {
  try {
    const { action, counterAmount, counterMessage } = req.body;
    if (!['counter', 'accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be counter, accept, or reject' });
    }

    const offer = await query('SELECT * FROM offers WHERE id = $1', [req.params.id]);
    if (offer.rows.length === 0) return res.status(404).json({ error: 'Offer not found' });

    let newStatus;
    let updateFields = 'updated_at = NOW()';

    if (action === 'accept') {
      newStatus = 'accepted';
      await query("UPDATE vehicles SET status = 'reserved', updated_at = NOW() WHERE id = $1", [offer.rows[0].vehicle_id]);
    } else if (action === 'reject') {
      newStatus = 'rejected';
    } else if (action === 'counter') {
      if (!counterAmount) return res.status(400).json({ error: 'Counter amount required' });
      newStatus = 'countered';
      updateFields += `, counter_amount = $2, counter_message = $3`;
    }

    const result = await query(
      `UPDATE offers SET status = '${newStatus}', ${updateFields} WHERE id = $1 RETURNING *`,
      action === 'counter' ? [req.params.id, counterAmount, counterMessage || null] : [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to respond to offer' });
  }
});

module.exports = router;
