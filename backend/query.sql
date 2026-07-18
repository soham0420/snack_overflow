CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    deviceFingerprint TEXT,
    deviceName TEXT,
    createdAt TEXT,
    lastLogin TEXT,
    trusted INTEGER DEFAULT 1
);