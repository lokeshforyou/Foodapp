const express = require('express');
const router = express.Router();
const { runAsync, getAsync, allAsync } = require('../db');

router.post('/', async (req, res) => {
  try {
    const { customerName, address, items } = req.body;
    if (!customerName || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid order payload' });
    }

    // Each item should be { menuId, qty, price_cents } (client sends menuId+qty; server looks up price)
    // Compute total
    let total = 0;
    const orderItems = [];
    for (const it of items) {
      const menu = await getAsync('SELECT id, price_cents FROM menu WHERE id = ?', [it.menuId]);
      if (!menu) return res.status(400).json({ error: `Menu item ${it.menuId} not found` });
      const qty = Math.max(1, parseInt(it.qty || 1, 10));
      const price_cents = menu.price_cents;
      total += price_cents * qty;
      orderItems.push({ menuId: menu.id, qty, price_cents });
    }

    const result = await runAsync('INSERT INTO orders (customer_name, address, total_cents) VALUES (?, ?, ?)', [customerName, address || '', total]);
    const orderId = result.lastID;

    const insertItemStmt = 'INSERT INTO order_items (order_id, menu_id, quantity, price_cents) VALUES (?, ?, ?, ?)';
    for (const oi of orderItems) {
      await runAsync(insertItemStmt, [orderId, oi.menuId, oi.qty, oi.price_cents]);
    }

    const order = await getAsync('SELECT id, customer_name as customerName, address, total_cents as total_cents, created_at FROM orders WHERE id = ?', [orderId]);
    res.status(201).json({ orderId: orderId, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await getAsync('SELECT id, customer_name as customerName, address, total_cents as total_cents, created_at FROM orders WHERE id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const items = await allAsync(
      `SELECT oi.id, oi.menu_id as menuId, oi.quantity as qty, oi.price_cents, m.name
       FROM order_items oi JOIN menu m ON oi.menu_id = m.id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );
    res.json({ order, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

module.exports = router;
