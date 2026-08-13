const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'data.db');
const exists = fs.existsSync(DB_PATH);

const db = new sqlite3.Database(DB_PATH);

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function init() {
  await runAsync(`
    CREATE TABLE IF NOT EXISTS menu (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price_cents INTEGER NOT NULL,
      image_url TEXT,
      category TEXT
    )
  `);
  await runAsync(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      address TEXT,
      total_cents INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await runAsync(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      menu_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price_cents INTEGER NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id),
      FOREIGN KEY(menu_id) REFERENCES menu(id)
    )
  `);

  // Seed menu if empty
  const row = await getAsync('SELECT COUNT(*) as cnt FROM menu');
  if (!row || row.cnt === 0) {
    const items = [
      ['Margherita Pizza', 'Classic pizza with tomato, mozzarella, basil', 899, 'https://via.placeholder.com/160', 'Pizza'],
      ['Pepperoni Pizza', 'Pepperoni, mozzarella, tomato sauce', 999, 'https://via.placeholder.com/160', 'Pizza'],
      ['Caesar Salad', 'Romaine, croutons, parmesan, Caesar dressing', 699, 'https://via.placeholder.com/160', 'Salad'],
      ['Cheeseburger', 'Beef patty, cheddar, lettuce, tomato', 1099, 'https://via.placeholder.com/160', 'Burger'],
      ['Veggie Wrap', 'Grilled veggies, hummus, spinach wrap', 799, 'https://via.placeholder.com/160', 'Wrap']
    ];
    const stmt = db.prepare('INSERT INTO menu (name, description, price_cents, image_url, category) VALUES (?, ?, ?, ?, ?)');
    for (const it of items) stmt.run(it);
    stmt.finalize();
    console.log('Seeded menu items');
  }
}

module.exports = { db, init, runAsync, allAsync, getAsync };
