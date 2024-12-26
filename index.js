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

// PUT route to update a user
app.put('/update-user/:id', (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).send('Name and email are required');
    }

    const query = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
    db.run(query, [name, email, id], function (err) {
        if (err) {
            console.error('Error updating user:', err.message);
            return res.status(500).send('Error updating user');
        }
        res.send(`User with ID: ${id} updated successfully.`);
    });
});

// DELETE route to delete a user
app.delete('/delete-user/:id', (req, res) => {
    const { id } = req.params;

    console.log(`Delete request received for user ID: ${id}`);

    const query = 'DELETE FROM users WHERE id = ?';
    db.run(query, [id], function (err) {
        if (err) {
            console.error('Error deleting user:', err.message);
            return res.status(500).send(`Error deleting user: ${err.message}`);
        }

        if (this.changes === 0) {
            console.warn(`No user found with ID: ${id}`);
            return res.status(404).send(`User with ID: ${id} not found`);
        }

        console.log(`User with ID: ${id} deleted successfully.`);
        res.send(`User with ID: ${id} deleted successfully.`);
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});