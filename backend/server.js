const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Multer for FormData (HTML forms)
const upload = multer({ storage: multer.memoryStorage() });

// MySQL CONNECTION POOL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 🔍 Optional startup DB check (non-blocking)
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL');
    connection.release();
  } catch (err) {
    console.error('❌ MySQL connection failed at startup:', err.message);
  }
})();

// POST /api/register
app.post('/api/register', upload.none(), async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const query = 'INSERT INTO users (name, email) VALUES (?, ?)';
    await pool.execute(query, [name, email]);

    res.json({ message: `User ${name} registered successfully!` });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// GET /api/users
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Health endpoint (useful for Docker / k8s)
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch {
    res.status(500).json({ status: 'db_error' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

// Added a search endpoint with SQL Injection and unsafe eval
app.get('/api/search', async (req, res) => {
  const username = req.query.name;

  //  SQL INJECTION: Using string concatenation instead of prepared statements

  const query = "SELECT * FROM users WHERE name = '" + username + "'";

  try {
    const [rows] = await pool.query(query);

    if (req.query.debug) {
      console.log('Debug info for: ${username}');
    }

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
