const express = require('express');
const mariadb = require('mariadb');
const cors = require('cors');
require('dotenv').config();
const Card = require('./models/Card'); // Adjust the path as necessary
const bodyParser = require('body-parser');
const cardRoutes = require('./routes/cards'); // Adjust the path as necessary

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json()); // Parse JSON bodies
app.use('/api', cardRoutes); // Use card routes under /api

// Create a pool of connections
const pool = mariadb.createPool({
  host: '192.168.0.116', 
  user: 'root', 
  password: 'Uttcoop1234#', 
  database: 'EV_chargerDB',
  connectionLimit: 5
});

const poolCoop = mariadb.createPool({
  host: '192.168.0.232', // Adjust if necessary
  user: 'admin', 
  password: 'admin1234#', 
  database: 'coop_uat', // Database name for coop
  connectionLimit: 5
});

// Test the connection
pool.getConnection()
  .then(conn => {
    console.log('Connected to MariaDB successfully');
    conn.release(); // Release the connection back to the pool
  })
  .catch(err => {
    console.error('MariaDB connection error:', err);
    process.exit(1);
  });

// Function to fetch users from the coop database
async function fetchUsersFromCoop() {
  let conn;
  try {
    conn = await poolCoop.getConnection();
    const rows = await conn.query("SELECT * FROM auth_user"); // Adjust the query as needed
    return rows;
  } catch (err) {
    console.error('Error fetching users from coop:', err);
    throw err; // Rethrow the error for further handling
  } finally {
    if (conn) conn.release(); // Release the connection back to the pool
  }
}

// Example usage of fetchUsersFromCoop
app.get('/api/coop-users', async (req, res) => {
  try {
    const users = await fetchUsersFromCoop();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Function to fetch user details by username
async function fetchUserByUsername(username) {
  let conn;
  try {
    conn = await poolCoop.getConnection();
    const rows = await conn.query("SELECT first_name, last_name , email FROM auth_user WHERE username = ?", [username]);
    return rows[0]; // Return the first matching user
  } catch (err) {
    console.error('Error fetching user:', err);
    throw err; // Rethrow the error for further handling
  } finally {
    if (conn) conn.release(); // Release the connection back to the pool
  }
}

// API endpoint to get user details by username
app.get('/api/coop-users/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const user = await fetchUserByUsername(username);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Function to add a new card
const addCard = async (userId, cardNumber, expirationDate) => {
  const sql = "INSERT INTO Cards (user_id, card_number, expiration_date) VALUES (?, ?, ?)";
  const params = [userId, cardNumber, expirationDate];

  let conn;
  try {
    conn = await pool.getConnection(); // Use the MariaDB connection pool
    const result = await conn.query(sql, params);
    return result; // Return the result of the query
  } catch (error) {
    console.error('Error saving card:', error);
    throw new Error('Could not add card');
  } finally {
    if (conn) conn.release(); // Release the connection back to the pool
  }
};

// API endpoint to add a card
const router = express.Router();

router.post('/api/cards', async (req, res) => {
  const { userId, cardNumber, expirationDate } = req.body;

  try {
    // Validate input data
    if (!userId || !cardNumber || !expirationDate) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newCard = new Card(userId, cardNumber, expirationDate);
    const result = await addCard(userId, cardNumber, expirationDate); // Call the addCard function
    res.status(201).json({ cardNumber: cardNumber }); // Return the card number
  } catch (error) {
    console.error('Error saving card:', error);
    res.status(500).json({ message: 'Error saving card', error: error.message });
  }
});

// Routes
app.use('/api/cards', require('./routes/cards'));
app.use('/api/usage', require('./routes/usage'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = router; 