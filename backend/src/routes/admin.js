const express = require('express');
const { query } = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, requireAdmin);

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [vehicles, purchases, revenue, users, offers, sellSubmissions] = await Promise.all([
      query("SELECT COUNT(*) FROM vehicles"),
      query("SELECT COUNT(*) FROM purchases WHERE status != 'cancelled'"),
      query("SELECT COALESCE(SUM(total_amount), 0) as total FROM purchases WHERE status IN ('confirmed', 'completed')"),
      query("SELECT COUNT(*) FROM users WHERE role = 'customer'"),
      query("SELECT COUNT(*) FROM offers WHERE status = 'pending'"),
      query("SELECT COUNT(*) FROM sell_submissions WHERE status = 'pending'")
    ]);
    res.json({
      totalVehicles: parseInt(vehicles.rows[0].count),
      totalPurchases: parseInt(purchases.rows[0].count),
      totalRevenue: parseFloat(revenue.rows[0].total),
      totalCustomers: parseInt(users.rows[0].count),
      pendingOffers: parseInt(offers.rows[0].count),
      pendingSellSubmissions: parseInt(sellSubmissions.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// All vehicles (including non-available)
router.get('/vehicles', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let where = '';
    let params = [];
    if (status) { where = 'WHERE v.status = $1'; params.push(status); }

    const countResult = await query(`SELECT COUNT(*) FROM vehicles v ${where}`, params);
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const result = await query(`
      SELECT v.*, c.name as category_name
      FROM vehicles v LEFT JOIN categories c ON v.category_id = c.id
      ${where} ORDER BY v.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, parseInt(limit), offset]);

    res.json({ vehicles: result.rows, pagination: { total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Add vehicle
router.post('/vehicles', async (req, res) => {
  try {
    const { title, description, make, model, year, price, mileage, exteriorColor, interiorColor, transmission, fuelType, engine, drivetrain, vin, imageUrl, categoryId, condition, featured } = req.body;
    if (!title || !make || !model || !year || !price) return res.status(400).json({ error: 'Title, make, model, year, and price required' });

    const result = await query(
      `INSERT INTO vehicles (title, description, make, model, year, price, mileage, exterior_color, interior_color, transmission, fuel_type, engine, drivetrain, vin, image_url, category_id, condition, featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *`,
      [title, description || null, make, model, parseInt(year), parseFloat(price), parseInt(mileage) || 0, exteriorColor || null, interiorColor || null, transmission || 'automatic', fuelType || 'gasoline', engine || null, drivetrain || 'rwd', vin || null, imageUrl || null, categoryId || null, condition || 'new', featured || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add vehicle' });
  }
});

// Update vehicle
router.put('/vehicles/:id', async (req, res) => {
  try {
    const fields = req.body;
    const setClauses = [];
    const values = [];
    let idx = 1;

    const allowed = ['title', 'description', 'make', 'model', 'year', 'price', 'mileage', 'exterior_color', 'interior_color', 'transmission', 'fuel_type', 'engine', 'drivetrain', 'vin', 'image_url', 'category_id', 'condition', 'featured', 'status'];
    for (const [key, val] of Object.entries(fields)) {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowed.includes(dbKey)) {
        setClauses.push(`${dbKey} = $${idx++}`);
        values.push(val);
      }
    }

    if (setClauses.length === 0) return res.status(400).json({ error: 'No valid fields to update' });
    setClauses.push(`updated_at = NOW()`);
    values.push(req.params.id);

    const result = await query(`UPDATE vehicles SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

// Delete vehicle
router.delete('/vehicles/:id', async (req, res) => {
  try {
    await query('DELETE FROM vehicles WHERE id = $1', [req.params.id]);
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

// All purchases
router.get('/purchases', async (req, res) => {
  try {
    const result = await query(`
      SELECT p.*, v.title, v.make, v.model, v.year, u.first_name, u.last_name, u.email
      FROM purchases p JOIN vehicles v ON p.vehicle_id = v.id JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

// Update purchase status
router.put('/purchases/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await query("UPDATE purchases SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *", [status, req.params.id]);
    if (status === 'completed') {
      await query("UPDATE vehicles SET status = 'sold', updated_at = NOW() WHERE id = $1", [result.rows[0].vehicle_id]);
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update purchase' });
  }
});

// All sell submissions
router.get('/sell-submissions', async (req, res) => {
  try {
    const { status } = req.query;
    let where = '';
    let params = [];
    if (status) { where = 'WHERE s.status = $1'; params.push(status); }
    const result = await query(`
      SELECT s.*, u.first_name, u.last_name, u.email
      FROM sell_submissions s LEFT JOIN users u ON s.user_id = u.id
      ${where} ORDER BY s.created_at DESC
    `, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Update sell submission
router.put('/sell-submissions/:id', async (req, res) => {
  try {
    const { status, adminNotes, offeredPrice } = req.body;
    const result = await query(
      'UPDATE sell_submissions SET status = $1, admin_notes = $2, offered_price = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [status, adminNotes || null, offeredPrice || null, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update submission' });
  }
});

// All offers
router.get('/offers', async (req, res) => {
  try {
    const result = await query(`
      SELECT o.*, v.title, v.make, v.model, v.year, v.price as listed_price, u.first_name, u.last_name, u.email
      FROM offers o JOIN vehicles v ON o.vehicle_id = v.id JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

// All users
router.get('/users', async (req, res) => {
  try {
    const result = await query('SELECT id, email, first_name, last_name, phone, role, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// All inquiries
router.get('/inquiries', async (req, res) => {
  try {
    const result = await query(`
      SELECT i.*, v.title as vehicle_title FROM inquiries i
      LEFT JOIN vehicles v ON i.vehicle_id = v.id
      ORDER BY i.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

module.exports = router;
