// Importing required libraries
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();

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

// Define a test route
app.get('/', (req, res) => {
    res.send('Hello, world!');
});

// POST route to add a user
app.post('/add-user', async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).send('Name and email are required');
    }

    try {
        const query = 'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id';
        const result = await pool.query(query, [name, email]);
        res.send(`User added successfully with ID: ${result.rows[0].id}`);
    } catch (err) {
        console.error('Error inserting user:', err.message);
        res.status(500).send('An unexpected error occurred. Please try again later.');
    }
});

// Serve Login Area
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
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

// GET route to list all users
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error('Error retrieving users:', err.message);
        res.status(500).send('An unexpected error occurred. Please try again later.');
    }
});

// PUT route to update a user
app.put('/update-user/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).send('Name and email are required');
    }

    try {
        const query = 'UPDATE users SET name = $1, email = $2 WHERE id = $3';
        const result = await pool.query(query, [name, email, id]);

        if (result.rowCount === 0) {
            return res.status(404).send(`User with ID: ${id} not found`);
        }

        res.send(`User with ID: ${id} updated successfully.`);
    } catch (err) {
        console.error('Error updating user:', err.message);
        res.status(500).send('An unexpected error occurred. Please try again later.');
    }
});

// DELETE route to delete a user
app.delete('/delete-user/:id', async (req, res) => {
    const { id } = req.params; // Extract 'id' from URL parameters
    console.log(`Deleting user with ID: ${id}`); // Debugging

    if (!id) {
        return res.status(400).send({ message: 'User ID is required' });
    }

    try {
        const query = 'DELETE FROM users WHERE id = $1';
        const result = await pool.query(query, [id]);
        if (result.rowCount === 0) {
            return res.status(404).send({ message: `User with ID: ${id} not found` });
        }
        res.send({ message: `User with ID: ${id} deleted successfully.` });
    } catch (err) {
        console.error('Error deleting user:', err.message);
        res.status(500).send({ message: 'An error occurred during deletion.' });
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});