// Importing required libraries
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite database
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');

        // Create the "users" table if it doesn't exist
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE
            )
        `, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            } else {
                console.log('Users table created or already exists.');
            }
        });
    }
});

// Middleware to parse JSON request bodies
app.use(express.json());

// Define a route for testing
app.get('/', (req, res) => {
    res.send('Hello, world!');
});

// POST route to add a user (Save to SQLite database)
app.post('/add-user', (req, res) => {
    const { name, email } = req.body;

    // Validate input
    if (!name || !email) {
        return res.status(400).send('Name and email are required');
    }

    // Insert user into the database
    const query = 'INSERT INTO users (name, email) VALUES (?, ?)';
    db.run(query, [name, email], function (err) {
        if (err) {
            console.error('Error inserting user:', err.message); // Log the error
            return res.status(500).send(`Error saving user: ${err.message}`); // Send error details to the client
        }
        res.send(`User added successfully with ID: ${this.lastID}`);
    });
});

// GET route to list all users (Retrieve from SQLite database)
app.get('/users', (req, res) => {
    const query = 'SELECT * FROM users';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error retrieving users:', err.message);
            return res.status(500).send('Error retrieving users');
        }
        res.json(rows);
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});