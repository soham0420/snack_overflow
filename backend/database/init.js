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

// Add 2FA columns if they don't already exist (safe to run every server start)
const addColumnIfMissing = (columnName, columnDef) => {
  const existingColumns = db.prepare("PRAGMA table_info(users)").all();
  const alreadyExists = existingColumns.some((col) => col.name === columnName);

  if (!alreadyExists) {
    db.exec(`ALTER TABLE users ADD COLUMN ${columnName} ${columnDef}`);
    console.log(`✅ Added column: ${columnName}`);
  }
};

addColumnIfMissing("twoFactorSecret", "TEXT");
addColumnIfMissing("twoFactorEnabled", "INTEGER DEFAULT 0");

console.log("✅ Users table created");