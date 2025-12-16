const express = require("express");
const db = require("../db");
function getRole(req) {
  const role = String(req?.query?.role ?? req?.body?.role ?? "user").toLowerCase();
  return ["admin", "manager", "user"].includes(role) ? role : "user";
}
const router = express.Router();

function requireRole(...allowed) {
  return (req, res, next) => {
    const role = getRole(req);
    if (!allowed.includes(role)) {
      return res.status(403).send("403 Forbidden: insufficient role");
    }
    next();
  };
}

router.get("/", (req, res) => {
  const role = getRole(req);
  res.render("home", { role, isAdmin: role === "admin", isManager: role === "manager", isUser: role === "user" });
});

// --- Report: Top 10 spending customers for a month (parameterized) ---
router.get("/reports/top-customers", async (req, res) => {
  const role = getRole(req);
  const month = req.query.month || "2024-01-01"; // YYYY-MM-01

  const start = month;
  const end = month.slice(0, 8) + String(Number(month.slice(8, 10)) + 1).padStart(2, "0"); // naive month+1 for quick demo
  // Better: do month range in SQL to avoid JS month math edge cases:
  // end = DATE_ADD(?, INTERVAL 1 MONTH)

  const explain = req.query.explain === "1";
  const analyze = req.query.analyze === "1";

  const sql = `
    SELECT
      c.customer_id,
      c.customer_name,
      SUM(oi.quantity * oi.unit_price) AS total_spent
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.order_date >= ? AND o.order_date < DATE_ADD(?, INTERVAL 1 MONTH)
    GROUP BY c.customer_id, c.customer_name
    ORDER BY total_spent DESC
    LIMIT 10;
  `;

  try {
    let plan = null;

    if (explain) {
      const [rows] = await db.query(`EXPLAIN ${sql}`, [start, start]);
      plan = rows;
    }

    if (analyze) {
      // MySQL 8.0.18+ supports EXPLAIN ANALYZE
      const [rows] = await db.query(`EXPLAIN ANALYZE ${sql}`, [start, start]);
      plan = rows;
    }

    const t0 = Date.now();
    const [results] = await db.query(sql, [start, start]);
    const ms = Date.now() - t0;

    res.render("top-customers", {
      role,
      isAdmin: role === "admin",
      isManager: role === "manager",
      isUser: role === "user",
      month,
      runtimeMs: ms,
      results,
      planJson: plan ? JSON.stringify(plan, null, 2) : null,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// --- Admin: create/drop indexes required by the practical ---
router.get("/admin", requireRole("admin"), async (req, res) => {
  const role = getRole(req);
  const [indexes] = await db.query(`SHOW INDEX FROM orders;`);
  res.render("admin", { role, isAdmin: true, indexes, msg: req.query.msg || "" });
});

router.post("/admin/index/create-order-date", requireRole("admin"), async (req, res) => {
  try {
    await db.query(`CREATE INDEX idx_orders_order_date ON orders(order_date);`);
    res.redirect("/admin?role=admin&msg=Created idx_orders_order_date");
  } catch (e) {
    res.redirect("/admin?role=admin&msg=" + encodeURIComponent(e.message));
  }
});

router.post("/admin/index/drop-order-date", requireRole("admin"), async (req, res) => {
  try {
    await db.query(`DROP INDEX idx_orders_order_date ON orders;`);
    res.redirect("/admin?role=admin&msg=Dropped idx_orders_order_date");
  } catch (e) {
    res.redirect("/admin?role=admin&msg=" + encodeURIComponent(e.message));
  }
});

// --- Simulated MV: customer_monthly_spending_mv (Admin + Manager) ---
router.post("/admin/mv/create", requireRole("admin", "manager"), async (req, res) => {
  const role = getRole(req);
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS customer_monthly_spending_mv (
        customer_id INT,
        customer_name VARCHAR(100),
        order_month DATE,
        total_spent DECIMAL(15,2),
        order_count INT,
        PRIMARY KEY (customer_id, order_month),
        INDEX idx_customer_month (customer_id, order_month),
        INDEX idx_order_month (order_month)
      );
    `);
    res.redirect(`/admin?role=${role}&msg=MV table created (if not existed)`);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.post("/admin/mv/refresh", requireRole("admin", "manager"), async (req, res) => {
  const role = getRole(req);
  try {
    await db.query(`TRUNCATE TABLE customer_monthly_spending_mv;`);
    await db.query(`
      INSERT INTO customer_monthly_spending_mv (customer_id, customer_name, order_month, total_spent, order_count)
      SELECT
        c.customer_id,
        c.customer_name,
        DATE_FORMAT(o.order_date, '%Y-%m-01') AS order_month,
        SUM(oi.quantity * oi.unit_price) AS total_spent,
        COUNT(DISTINCT o.order_id) AS order_count
      FROM customers c
      JOIN orders o ON c.customer_id = o.customer_id
      JOIN order_items oi ON o.order_id = oi.order_id
      GROUP BY c.customer_id, c.customer_name, DATE_FORMAT(o.order_date, '%Y-%m-01');
    `);
    res.redirect(`/admin?role=${role}&msg=MV refreshed`);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/reports/mv-top-customers", async (req, res) => {
  const role = getRole(req);
  const month = req.query.month || "2024-01-01";
  try {
    const t0 = Date.now();
    const [rows] = await db.query(
      `SELECT customer_id, customer_name, total_spent
       FROM customer_monthly_spending_mv
       WHERE order_month = ?
       ORDER BY total_spent DESC
       LIMIT 10;`,
      [month]
    );
    const ms = Date.now() - t0;

    res.render("top-customers", {
      role,
      isAdmin: role === "admin",
      isManager: role === "manager",
      isUser: role === "user",
      month,
      runtimeMs: ms,
      results: rows,
      planJson: null,
      usingMv: true
    });
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;
