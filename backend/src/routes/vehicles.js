const express = require('express');
const { query } = require('../db');
const { optionalAuth, authenticate } = require('../middleware/auth');

const router = express.Router();

// List vehicles with filtering
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, make, model, year, minPrice, maxPrice, condition, fuel, transmission, search, featured, status, sort, page = 1, limit = 12 } = req.query;

    let conditions = [];
    let params = [];
    let idx = 1;

    if (status) {
      conditions.push(`v.status = $${idx++}`);
      params.push(status);
    } else {
      conditions.push(`v.status = 'available'`);
    }

    if (category) { conditions.push(`c.slug = $${idx++}`); params.push(category); }
    if (make) { conditions.push(`LOWER(v.make) = LOWER($${idx++})`); params.push(make); }
    if (model) { conditions.push(`LOWER(v.model) LIKE $${idx++}`); params.push(`%${model}%`); }
    if (year) { conditions.push(`v.year = $${idx++}`); params.push(parseInt(year)); }
    if (minPrice) { conditions.push(`v.price >= $${idx++}`); params.push(parseFloat(minPrice)); }
    if (maxPrice) { conditions.push(`v.price <= $${idx++}`); params.push(parseFloat(maxPrice)); }
    if (condition) { conditions.push(`v.condition = $${idx++}`); params.push(condition); }
    if (fuel) { conditions.push(`v.fuel_type = $${idx++}`); params.push(fuel); }
    if (transmission) { conditions.push(`v.transmission = $${idx++}`); params.push(transmission); }
    if (featured === 'true') { conditions.push(`v.featured = true`); }
    if (search) {
      conditions.push(`(LOWER(v.title) LIKE $${idx} OR LOWER(v.make) LIKE $${idx} OR LOWER(v.model) LIKE $${idx} OR LOWER(v.description) LIKE $${idx})`);
      params.push(`%${search.toLowerCase()}%`);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const orderMap = {
      'price-asc': 'v.price ASC',
      'price-desc': 'v.price DESC',
      'year-desc': 'v.year DESC',
      'year-asc': 'v.year ASC',
      'newest': 'v.created_at DESC',
      'mileage': 'v.mileage ASC'
    };
    const orderBy = orderMap[sort] || 'v.created_at DESC';

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const countResult = await query(`SELECT COUNT(*) FROM vehicles v LEFT JOIN categories c ON v.category_id = c.id ${where}`, params);

    const result = await query(`
      SELECT v.*, c.name as category_name, c.slug as category_slug,
             u.first_name as seller_first_name, u.last_name as seller_last_name
      FROM vehicles v
      LEFT JOIN categories c ON v.category_id = c.id
      LEFT JOIN users u ON v.seller_id = u.id
      ${where}
      ORDER BY ${orderBy}
      LIMIT $${idx++} OFFSET $${idx++}
    `, [...params, parseInt(limit), offset]);

    res.json({
      vehicles: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit))
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Get makes list
router.get('/makes', async (req, res) => {
  try {
    const result = await query("SELECT DISTINCT make FROM vehicles WHERE status = 'available' ORDER BY make");
    res.json(result.rows.map(r => r.make));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch makes' });
  }
});

// Get categories
router.get('/categories', async (req, res) => {
  try {
    const result = await query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Single vehicle
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const result = await query(`
      SELECT v.*, c.name as category_name, c.slug as category_slug,
             u.first_name as seller_first_name, u.last_name as seller_last_name, u.email as seller_email
      FROM vehicles v
      LEFT JOIN categories c ON v.category_id = c.id
      LEFT JOIN users u ON v.seller_id = u.id
      WHERE v.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });

    const vehicle = result.rows[0];

    // Check if saved by current user
    if (req.user) {
      const saved = await query('SELECT 1 FROM saved_vehicles WHERE user_id = $1 AND vehicle_id = $2', [req.user.id, vehicle.id]);
      vehicle.isSaved = saved.rows.length > 0;
    }

    // Get reviews
    const reviews = await query(`
      SELECT r.*, u.first_name, u.last_name FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.vehicle_id = $1 ORDER BY r.created_at DESC
    `, [vehicle.id]);
    vehicle.reviews = reviews.rows;

    res.json(vehicle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

// Save/unsave vehicle
router.post('/:id/save', authenticate, async (req, res) => {
  try {
    const existing = await query('SELECT 1 FROM saved_vehicles WHERE user_id = $1 AND vehicle_id = $2', [req.user.id, req.params.id]);
    if (existing.rows.length > 0) {
      await query('DELETE FROM saved_vehicles WHERE user_id = $1 AND vehicle_id = $2', [req.user.id, req.params.id]);
      res.json({ saved: false });
    } else {
      await query('INSERT INTO saved_vehicles (user_id, vehicle_id) VALUES ($1, $2)', [req.user.id, req.params.id]);
      res.json({ saved: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update saved status' });
  }
});

// Get saved vehicles
router.get('/user/saved', authenticate, async (req, res) => {
  try {
    const result = await query(`
      SELECT v.*, c.name as category_name FROM vehicles v
      LEFT JOIN categories c ON v.category_id = c.id
      JOIN saved_vehicles sv ON v.id = sv.vehicle_id
      WHERE sv.user_id = $1 ORDER BY sv.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved vehicles' });
  }
});

// Add review
router.post('/:id/reviews', authenticate, async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });

    const result = await query(
      'INSERT INTO reviews (user_id, vehicle_id, rating, title, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, req.params.id, rating, title || null, comment || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add review' });
  }
});

module.exports = router;
