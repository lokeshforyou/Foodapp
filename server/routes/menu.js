const express = require('express');
const router = express.Router();
const { allAsync, getAsync } = require('../db');

router.get('/', async (req, res) => {
  try {
    const items = await allAsync('SELECT id, name, description, price_cents, image_url, category FROM menu ORDER BY category, name');
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await getAsync('SELECT id, name, description, price_cents, image_url, category FROM menu WHERE id = ?', [req.params.id]);
    if (!item) return res.status(404).json({ error: 'Menu item not found' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
});

module.exports = router;
