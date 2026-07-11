const express = require('express');
const { query } = require('../db');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Submit a car for sale
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { make, model, year, mileage, condition, vin, askingPrice, imageUrl, additionalInfo } = req.body;
    if (!make || !model || !year) return res.status(400).json({ error: 'Make, model, and year are required' });

    const result = await query(
      `INSERT INTO sell_submissions (user_id, make, model, year, mileage, condition, vin, asking_price, image_url, additional_info)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [req.user?.id || null, make, model, parseInt(year), parseInt(mileage) || 0, condition || 'good', vin || null, askingPrice || null, imageUrl || null, additionalInfo || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit sell request' });
  }
});

// Get my submissions
router.get('/my', authenticate, async (req, res) => {
  try {
    const result = await query('SELECT * FROM sell_submissions WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

module.exports = router;
