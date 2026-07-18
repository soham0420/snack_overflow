const db = require("./db");

const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    isVerified INTEGER DEFAULT 0,
    verificationToken TEXT,
    verificationTokenExpiry TEXT,
    resetToken TEXT,
    resetTokenExpiry TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
`;

db.exec(createUsersTable);

console.log("✅ Users table created");