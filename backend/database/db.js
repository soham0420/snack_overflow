const Database = require("better-sqlite3");

// Creates auth.db if it doesn't exist
const db = new Database("auth.db");

console.log("✅ Connected to SQLite database");

module.exports = db;