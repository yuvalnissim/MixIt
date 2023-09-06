const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Define the path to your SQLite database file
const dbPath = path.resolve(__dirname, 'path/to/database.db');

// Connect to the SQLite database
const db = new sqlite3.Database(dbPath);

// Create the scores table if it doesn't exist
db.run('CREATE TABLE IF NOT EXISTS scores (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, score INTEGER)');

module.exports = db;
