const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sims_db',
  waitForConnections: true,
  connectionLimit: 10,
});

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(session({
  secret: process.env.SESSION_SECRET || 'sims-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
}));

function authRequired(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashed]
    );
    res.json({ id: result.insertId, username });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Username already exists' });
    }
    console.error(error);
    res.status(500).json({ message: 'Could not create user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    req.session.userId = user.id;
    req.session.username = user.username;
    res.json({ id: user.id, username: user.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Forgot Password - Request reset
app.post('/api/auth/forgot-password', async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: 'Username required' });
  }

  try {
    const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ 
      message: 'Password reset instructions sent', 
      userId: rows[0].id,
      note: 'For demo: you can reset password using the reset endpoint'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Reset Password - with username verification
app.post('/api/auth/reset-password', async (req, res) => {
  const { username, newPassword } = req.body;

  if (!username || !newPassword) {
    return res.status(400).json({ message: 'Username and new password required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    const [result] = await pool.query(
      'UPDATE users SET password = ? WHERE username = ?', 
      [hashed, username]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Password reset successfully. Please login with your new password.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Database error' });
  }
});

app.post('/api/auth/logout', authRequired, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logged out' });
  });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.session.userId) {
    return res.json({ authenticated: false });
  }
  res.json({ authenticated: true, id: req.session.userId, username: req.session.username });
});

app.post('/api/spare-parts', authRequired, async (req, res) => {
  const { name, category, quantity, unitPrice } = req.body;
  if (!name || !category || quantity == null || unitPrice == null) {
    return res.status(400).json({ message: 'Missing spare part data' });
  }

  try {
    const totalPrice = quantity * unitPrice;
    const [result] = await pool.query(
      'INSERT INTO spare_part (name, category, quantity, unitPrice, totalPrice) VALUES (?, ?, ?, ?, ?)',
      [name, category, quantity, unitPrice, totalPrice]
    );
    res.json({ id: result.insertId, name, category, quantity, unitPrice, totalPrice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not create spare part' });
  }
});

app.get('/api/spare-parts', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM spare_part ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not fetch spare parts' });
  }
});

app.put('/api/spare-parts/:id', authRequired, async (req, res) => {
  const { id } = req.params;
  const { name, category, quantity, unitPrice } = req.body;
  if (!name || !category || quantity == null || unitPrice == null) {
    return res.status(400).json({ message: 'Missing spare part data' });
  }

  try {
    const totalPrice = quantity * unitPrice;
    await pool.query(
      'UPDATE spare_part SET name = ?, category = ?, quantity = ?, unitPrice = ?, totalPrice = ? WHERE id = ?',
      [name, category, quantity, unitPrice, totalPrice, id]
    );
    res.json({ id: Number(id), name, category, quantity, unitPrice, totalPrice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not update spare part' });
  }
});

app.delete('/api/spare-parts/:id', authRequired, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM spare_part WHERE id = ?', [id]);
    res.json({ message: 'Spare part deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not delete spare part' });
  }
});

app.get('/api/stock-in', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT si.*, sp.name AS sparePartName FROM stock_in si JOIN spare_part sp ON si.sparePartId = sp.id ORDER BY si.stockInDate DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not fetch stock in records' });
  }
});

app.post('/api/stock-in', authRequired, async (req, res) => {
  const { sparePartId, stockInQuantity, stockInDate } = req.body;
  if (!sparePartId || stockInQuantity == null || !stockInDate) {
    return res.status(400).json({ message: 'Missing stock in data' });
  }

  try {
    await pool.query('INSERT INTO stock_in (sparePartId, stockInQuantity, stockInDate) VALUES (?, ?, ?)', [sparePartId, stockInQuantity, stockInDate]);
    await pool.query('UPDATE spare_part SET quantity = quantity + ? WHERE id = ?', [stockInQuantity, sparePartId]);
    res.json({ message: 'Stock in recorded' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not record stock in' });
  }
});

app.get('/api/stock-out', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT so.*, sp.name AS sparePartName, u.username AS issuedBy FROM stock_out so JOIN spare_part sp ON so.sparePartId = sp.id JOIN users u ON so.userId = u.id ORDER BY so.stockOutDate DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not fetch stock out records' });
  }
});

app.post('/api/stock-out', authRequired, async (req, res) => {
  const { sparePartId, stockOutQuantity, stockOutUnitPrice, stockOutDate } = req.body;
  if (!sparePartId || stockOutQuantity == null || stockOutUnitPrice == null || !stockOutDate) {
    return res.status(400).json({ message: 'Missing stock out data' });
  }

  try {
    const [spareRows] = await pool.query('SELECT quantity FROM spare_part WHERE id = ?', [sparePartId]);
    const spare = spareRows[0];
    if (!spare || spare.quantity < stockOutQuantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const totalPrice = stockOutQuantity * stockOutUnitPrice;
    await pool.query(
      'INSERT INTO stock_out (sparePartId, userId, stockOutQuantity, stockOutUnitPrice, stockOutTotalPrice, stockOutDate) VALUES (?, ?, ?, ?, ?, ?)',
      [sparePartId, req.session.userId, stockOutQuantity, stockOutUnitPrice, totalPrice, stockOutDate]
    );
    await pool.query('UPDATE spare_part SET quantity = quantity - ? WHERE id = ?', [stockOutQuantity, sparePartId]);
    res.json({ message: 'Stock out recorded' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not record stock out' });
  }
});

app.put('/api/stock-out/:id', authRequired, async (req, res) => {
  const { id } = req.params;
  const { sparePartId, stockOutQuantity, stockOutUnitPrice, stockOutDate } = req.body;
  if (!sparePartId || stockOutQuantity == null || stockOutUnitPrice == null || !stockOutDate) {
    return res.status(400).json({ message: 'Missing stock out data' });
  }

  try {
    const [existingRows] = await pool.query('SELECT * FROM stock_out WHERE id = ?', [id]);
    const existing = existingRows[0];
    if (!existing) {
      return res.status(404).json({ message: 'Stock out record not found' });
    }

    const quantityDiff = stockOutQuantity - existing.stockOutQuantity;
    const [spareRows] = await pool.query('SELECT quantity FROM spare_part WHERE id = ?', [sparePartId]);
    const spare = spareRows[0];
    if (!spare || spare.quantity < quantityDiff) {
      return res.status(400).json({ message: 'Insufficient stock to update' });
    }

    const totalPrice = stockOutQuantity * stockOutUnitPrice;
    await pool.query(
      'UPDATE stock_out SET sparePartId = ?, stockOutQuantity = ?, stockOutUnitPrice = ?, stockOutTotalPrice = ?, stockOutDate = ? WHERE id = ?',
      [sparePartId, stockOutQuantity, stockOutUnitPrice, totalPrice, stockOutDate, id]
    );
    await pool.query('UPDATE spare_part SET quantity = quantity - ? WHERE id = ?', [quantityDiff, sparePartId]);
    res.json({ message: 'Stock out updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not update stock out' });
  }
});

app.delete('/api/stock-out/:id', authRequired, async (req, res) => {
  const { id } = req.params;
  try {
    const [existingRows] = await pool.query('SELECT * FROM stock_out WHERE id = ?', [id]);
    const existing = existingRows[0];
    if (!existing) {
      return res.status(404).json({ message: 'Stock out record not found' });
    }

    await pool.query('DELETE FROM stock_out WHERE id = ?', [id]);
    await pool.query('UPDATE spare_part SET quantity = quantity + ? WHERE id = ?', [existing.stockOutQuantity, existing.sparePartId]);
    res.json({ message: 'Stock out deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not delete stock out' });
  }
});

app.get('/api/reports/daily-stock-out', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT so.stockOutDate AS date, sp.name AS sparePart, SUM(so.stockOutQuantity) AS totalQuantity
       FROM stock_out so
       JOIN spare_part sp ON so.sparePartId = sp.id
       GROUP BY so.stockOutDate, sp.name
       ORDER BY so.stockOutDate DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not generate daily stock out report' });
  }
});

app.get('/api/reports/stock-status', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sp.id, sp.name AS sparePart, sp.quantity AS storedQuantity,
        IFNULL(SUM(so.stockOutQuantity), 0) AS stockOutQuantity,
        sp.quantity - IFNULL(SUM(so.stockOutQuantity), 0) AS remainingQuantity
       FROM spare_part sp
       LEFT JOIN stock_out so ON sp.id = so.sparePartId
       GROUP BY sp.id, sp.name, sp.quantity
       ORDER BY sp.name`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not generate stock status report' });
  }
});

app.listen(port, () => {
  console.log(`SIMS backend listening at http://localhost:${port}`);
});
