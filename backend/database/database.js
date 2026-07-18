const Database = require("better-sqlite3");

const db = new Database("secureauth.db");

// ================= USERS =================
db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    riskScore INTEGER DEFAULT 0,
    verified INTEGER DEFAULT 0,

    failedAttempts INTEGER DEFAULT 0,
    lockUntil TEXT,
    approvalPhrase TEXT
);
`);

const columns = db.prepare("PRAGMA table_info(users)").all();

console.log(columns);

// ================= TRUSTED DEVICES =================
db.exec(`
CREATE TABLE IF NOT EXISTS trusted_devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    deviceFingerprint TEXT NOT NULL,
    deviceName TEXT,
    addedAt TEXT,

    FOREIGN KEY(userId) REFERENCES users(id)
);
`);

// ================= LOGIN HISTORY =================
db.exec(`
CREATE TABLE IF NOT EXISTS login_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    loginTime TEXT,
    ipAddress TEXT,
    userAgent TEXT,
    location TEXT,
    deviceFingerprint TEXT,
    riskScore INTEGER,
    decision TEXT,

    FOREIGN KEY(userId) REFERENCES users(id)
);
`);

console.log("✅ SQLite connected");

module.exports = db;