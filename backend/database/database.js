const Database = require("better-sqlite3");

const db = new Database("secureauth.db");

// ================= USERS =================
// Merged schema: Member 1's fields (name, verification, password reset)
// + Member 2's fields (riskScore, lockout, approval phrase)
db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Member 1: core identity
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    resetToken TEXT,
    resetTokenExpiry TEXT,

    -- Member 2: AI risk + lockout + step-up verification
    riskScore INTEGER DEFAULT 0,
    failedAttempts INTEGER DEFAULT 0,
    lockUntil TEXT,
    approvalPhrase TEXT,

    -- Real location risk check: city/country from the last successful login
    lastLocation TEXT,

    -- TOTP two-factor auth: base32 secret + whether it's confirmed/active.
    -- Secret is written as soon as setup starts but twoFactorEnabled stays
    -- 0 until a code is verified, same "don't trust it till it's proven"
    -- pattern as the approval phrase / step-up flow.
    twoFactorSecret TEXT,
    twoFactorEnabled INTEGER DEFAULT 0,

    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

// Safe migration: adds lastLocation to a users table that already existed
// before this column was introduced. Ignored if the column is already there.
try {
    db.exec(`ALTER TABLE users ADD COLUMN lastLocation TEXT;`);
} catch (err) {
    if (!err.message.includes("duplicate column")) {
        console.error("Migration warning:", err.message);
    }
}

// Safe migration: adds TOTP columns to a users table that already existed
// before 2FA was introduced. Ignored if the columns are already there.
try {
    db.exec(`ALTER TABLE users ADD COLUMN twoFactorSecret TEXT;`);
} catch (err) {
    if (!err.message.includes("duplicate column")) {
        console.error("Migration warning:", err.message);
    }
}
try {
    db.exec(`ALTER TABLE users ADD COLUMN twoFactorEnabled INTEGER DEFAULT 0;`);
} catch (err) {
    if (!err.message.includes("duplicate column")) {
        console.error("Migration warning:", err.message);
    }
}

// ================= TRUSTED DEVICES (Member 2) =================
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

// ================= LOGIN HISTORY (Member 2) =================
db.exec(`
CREATE TABLE IF NOT EXISTS login_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    device TEXT,
    location TEXT,
    loginTime TEXT,
    failedAttempts INTEGER DEFAULT 0,
    vpnDetected INTEGER DEFAULT 0,
    riskScore INTEGER,
    decision TEXT,
    reasons TEXT,
    createdAt TEXT,

    FOREIGN KEY(userId) REFERENCES users(id)
);
`);

// Safe migration for databases created before createdAt existed
try {
    db.exec(`ALTER TABLE login_history ADD COLUMN createdAt TEXT;`);
} catch (err) {
    if (!err.message.includes("duplicate column")) {
        console.error("Migration warning:", err.message);
    }
}

console.log("✅ SQLite connected (secureauth.db) — unified schema loaded");

module.exports = db;
