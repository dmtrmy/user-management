// Importing required libraries
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors'); // Import CORS middleware
const axios = require('axios'); // Import axios for HTTP requests
const app = express();

// Use CORS globally
const corsOptions = {
  origin: '*',  // Allow all origins (for testing). Change to specific frontend URL in production.
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
};
app.use(cors(corsOptions));

// Define the UUID Generator
function generateUUID() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // Character set
  let uuid = '';
  for (let i = 0; i < 6; i++) {
    uuid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return uuid;
}

// Ensure UUID Uniqueness
async function generateUniqueUUID() {
  let isUnique = false;
  let uuid;

  while (!isUnique) {
    uuid = generateUUID();
    const result = await pool.query('SELECT id FROM users WHERE uuid = $1', [uuid]);
    if (result.rowCount === 0) {
      isUnique = true;
    }
  }

  return uuid; // Return the unique UUID
}

// Serve static files with caching
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));

// Middleware to parse JSON request bodies
app.use(express.json());

// Initialize PostgreSQL connection pool
const pool = new Pool({
  user: 'user_management_db_2fao_user', // Your database username
  host: 'dpg-ctmg7dq3esus739osqhg-a.oregon-postgres.render.com', // Your database hostname
  database: 'user_management_db_2fao', // Your database name
  password: 'JrtDg6TZ61ojUDNJvc0kf2q2mfg0dc8W', // Your database password
  port: 5432, // Default PostgreSQL port
  ssl: {
    rejectUnauthorized: false, // Allows self-signed certificates
  },
});

// Test the connection
pool.connect((err) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err.message);
  } else {
    console.log('Connected to PostgreSQL database.');
  }
});

// POST route to add a user
app.post('/add-user', async (req, res) => {
    const { name, email, street, house_number, postal_code, city } = req.body; // Destructure address fields
  
    if (!name || !email || !street || !house_number || !postal_code || !city) {
      return res.status(400).send('All fields (name, email, address) are required');
    }
  
    try {
      // Check if the user already exists using /check-user route
      const checkUserResponse = await axios.post('https://user-management-0jfv.onrender.com/check-user', {
        email: email
      });
  
      const checkUserData = checkUserResponse.data;
  
      if (checkUserData.exists) {
        return res.status(400).send('User with this email already exists');
      }
  
      // Generate unique UUID for the new user
      const uuid = await generateUniqueUUID();
  
      // Insert the user along with address data into the database
      const query = `
        INSERT INTO users (name, email, street, house_number, postal_code, city, uuid)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
      `;
      const result = await pool.query(query, [name, email, street, house_number, postal_code, city, uuid]);
  
      res.send(`User added successfully with ID: ${result.rows[0].id} and UUID: ${uuid}`);
    } catch (err) {
      console.error('Error inserting user:', err.message);
      res.status(500).send('An unexpected error occurred. Please try again later.');
    }
  });

// POST route to check if a user exists based on their email
app.post('/check-user', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send('Email is required');
  }

  try {
    // Check if the user already exists in the database
    const query = 'SELECT id FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rowCount > 0) {
      // User exists
      return res.json({ exists: true });
    } else {
      // User does not exist
      return res.json({ exists: false });
    }
  } catch (err) {
    console.error('Error checking user existence:', err.message);
    res.status(500).send('An unexpected error occurred. Please try again later.');
  }
});

// Serve Login Area
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve Admin login redirect
app.get('/', (req, res) => {
    res.redirect('/admin');  // or wherever you want users to land after login
  });

// Serve B2C Area
app.get('/user', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'b2c.html'));
});

// Serve B2C Success page
app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

// Serve Admin Area
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/users', async (req, res) => {
    try {
        const query = `
            SELECT 
                uuid, 
                name, 
                email, 
                street, 
                house_number, 
                postal_code, 
                city, 
                TO_CHAR(created_at, 'DD.MM.YYYY') AS created_at 
            FROM users
        `;
        const result = await pool.query(query);
        res.json(result.rows); // Return all the user data including address fields
    } catch (err) {
        console.error('Error retrieving users:', err.message);
        res.status(500).send('An unexpected error occurred. Please try again later.');
    }
});

// PUT route to update a user
app.put('/update-user/:uuid', async (req, res) => {
  const { uuid } = req.params;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).send('Name and email are required');
  }

  try {
    const query = 'UPDATE users SET name = $1, email = $2 WHERE uuid = $3';
    const result = await pool.query(query, [name, email, uuid]);

    if (result.rowCount === 0) {
      return res.status(404).send(`User with UUID: ${uuid} not found`);
    }

    res.send(`User with UUID: ${uuid} updated successfully.`);
  } catch (err) {
    console.error('Error updating user:', err.message);
    res.status(500).send('An unexpected error occurred. Please try again later.');
  }
});

// DELETE route to delete a user
app.delete('/delete-user/:uuid', async (req, res) => {
  const { uuid } = req.params;

  console.log('Backend received UUID for deletion:', uuid); // Debug log to check if UUID is passed correctly

  if (!uuid) {
    return res.status(400).send({ message: 'User UUID is required' });
  }

  try {
    const query = 'DELETE FROM users WHERE uuid = $1';
    const result = await pool.query(query, [uuid]);

    if (result.rowCount === 0) {
      return res.status(404).send({ message: `User with UUID: ${uuid} not found` });
    }

    res.send({ message: `User with UUID: ${uuid} deleted successfully.` });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).send({ message: 'An error occurred during deletion.' });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});