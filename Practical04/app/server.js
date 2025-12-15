// app/server.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');

// ===== ROLE SIMULATION (PHASE 4) =====
// Change this value to test access control
// 'admin' | 'manager' | 'user'
const CURRENT_ROLE = 'manager';


const app = express();
app.use(express.json());
const PORT = 3000;

/* ==============================
   DATABASE CONNECTION (DOCKER)
================================ */
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});



db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.message);
    return;
  }
  console.log('Connected to MySQL');
});

/* ==============================
   BASIC ROUTES
================================ */

// Test server
app.get('/', (req, res) => {
  res.send('CM3010 Practical 4 — Server running');
});

// Test database query
app.get('/products', (req, res) => {
  const sql = `
    SELECT p.product_id, p.product_name, c.category_name, p.stock
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// ===== VIEW INVENTORY (ALL ROLES) =====
app.get('/inventory', (req, res) => {
  const sql = `
    SELECT p.product_id, p.product_name, c.category_name, p.stock
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
  `;


  db.query(sql, (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

// ===== ADD PRODUCT (ADMIN + MANAGER) =====
app.post('/add-product', (req, res) => {
  if (CURRENT_ROLE !== 'admin' && CURRENT_ROLE !== 'manager') {
    return res.status(403).send('Access denied');
  }

  const { product_name, category_id, stock } = req.body;

  const sql = `
    INSERT INTO products (product_name, category_id, stock)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [product_name, category_id, stock], err => {
    if (err) return res.status(500).send(err.message);
    res.send('Product added successfully');
  });
});

// ===== DRAW STOCK (ALL ROLES) =====
app.post('/draw-stock', (req, res) => {
  const { product_id, quantity } = req.body;

  const sql = `
  UPDATE products
  SET stock = stock - ?
  WHERE product_id = ? AND stock >= ?
`;


  db.query(sql, [quantity, product_id, quantity], (err, result) => {
    if (err) return res.status(500).send(err.message);

    if (result.affectedRows === 0) {
      return res.status(400).send('Insufficient stock');
    }

    res.send('Stock withdrawn successfully');
  });
});

// ===== INVENTORY SUMMARY (AGGREGATION) =====
app.get('/summary', (req, res) => {
  const sql = `
    SELECT c.category_name, SUM(p.stock) AS total_stock
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    GROUP BY c.category_name
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});


/* ==============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
