const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const JWT_SECRET = "secret123"; // change for production

// MySQL pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Vighneshghorpade@17", // <-- set your actual root password
  database: "rating_app",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware for authentication
function auth(role) {
  return (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.sendStatus(401);
    try {
      const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
      if (role && decoded.role !== role && decoded.role !== "admin") {
        return res.sendStatus(403);
      }
      req.user = decoded;
      next();
    } catch {
      res.sendStatus(401);
    }
  };
}

// ✅ Test route
app.get("/testdb", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS result");
    res.json({ message: "Backend working!", data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register
app.post("/api/signup", async (req, res) => {
  const { name, email, password, address } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (name,email,password,address,role) VALUES (?,?,?,?,?)",
      [name, email, hashed, address, "user"]
    );
    res.json({ message: "User registered" });
  } catch (e) {
    res.status(400).json({ error: "Email already exists" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email=?", [email]);
    if (rows.length === 0) return res.status(400).json({ error: "Invalid credentials" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: add store
app.post("/api/stores", auth("admin"), async (req, res) => {
  const { name, address, ownerId } = req.body;
  try {
    await pool.query(
      "INSERT INTO stores (name,address,owner_id) VALUES (?,?,?)",
      [name, address, ownerId]
    );
    res.json({ message: "Store created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User: list stores + ratings
app.get("/api/stores", auth(), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.id, s.name, s.address,
        IFNULL(AVG(r.rating),0) as avgRating,
        (SELECT rating FROM ratings WHERE user_id=? AND store_id=s.id) as userRating
      FROM stores s
      LEFT JOIN ratings r ON r.store_id=s.id
      GROUP BY s.id
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User: submit/update rating
app.post("/api/stores/:id/rate", auth("user"), async (req, res) => {
  const { rating } = req.body;
  const storeId = req.params.id;
  try {
    await pool.query(`
      INSERT INTO ratings (user_id, store_id, rating)
      VALUES (?,?,?)
      ON DUPLICATE KEY UPDATE rating=VALUES(rating)
    `, [req.user.id, storeId, rating]);
    res.json({ message: "Rating saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Store Owner dashboard
app.get("/api/owner/stats", auth("store_owner"), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.name, r.rating FROM ratings r
      JOIN users u ON u.id=r.user_id
      JOIN stores s ON s.id=r.store_id
      WHERE s.owner_id=?
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
