const express = require('express');
const { query } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Create purchase
router.post('/', authenticate, async (req, res) => {
  try {
    const { vehicleId, paymentMethod, financingTermMonths, notes } = req.body;
    if (!vehicleId) return res.status(400).json({ error: 'Vehicle ID required' });

    const vehicle = await query('SELECT * FROM vehicles WHERE id = $1 AND status = $2', [vehicleId, 'available']);
    if (vehicle.rows.length === 0) return res.status(404).json({ error: 'Vehicle not available' });

    const result = await query(
      `INSERT INTO purchases (user_id, vehicle_id, total_amount, payment_method, financing_term_months, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, vehicleId, vehicle.rows[0].price, paymentMethod || 'cash', financingTermMonths || null, notes || null]
    );

    await query("UPDATE vehicles SET status = 'reserved', updated_at = NOW() WHERE id = $1", [vehicleId]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create purchase' });
  }
});

// Get my purchases
router.get('/my', authenticate, async (req, res) => {
  try {
    const result = await query(`
      SELECT p.*, v.title, v.make, v.model, v.year, v.image_url, v.vin
      FROM purchases p JOIN vehicles v ON p.vehicle_id = v.id
      WHERE p.user_id = $1 ORDER BY p.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

// Get single purchase
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await query(`
      SELECT p.*, v.title, v.make, v.model, v.year, v.image_url, v.vin, v.price
      FROM purchases p JOIN vehicles v ON p.vehicle_id = v.id
      WHERE p.id = $1 AND p.user_id = $2
    `, [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Purchase not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch purchase' });
  }
});

// Cancel purchase
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const purchase = await query('SELECT * FROM purchases WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (purchase.rows.length === 0) return res.status(404).json({ error: 'Purchase not found' });

    const p = purchase.rows[0];
    if (p.status === 'completed') return res.status(400).json({ error: 'Cannot cancel completed purchase' });

    await query("UPDATE purchases SET status = 'cancelled', updated_at = NOW() WHERE id = $1", [p.id]);
    await query("UPDATE vehicles SET status = 'available', updated_at = NOW() WHERE id = $1", [p.vehicle_id]);

    res.json({ message: 'Purchase cancelled' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel purchase' });
  }
});

module.exports = router;
