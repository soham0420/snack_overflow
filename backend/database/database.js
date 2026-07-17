const Database = require("better-sqlite3");

const db = new Database("secureauth.db");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    riskScore INTEGER DEFAULT 0,
    verified INTEGER DEFAULT 0
);
`);

console.log("✅ SQLite connected");

module.exports = db;