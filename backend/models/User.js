const db = require("../database/database");

// ================= CREATE USER =================
function createUser({ name, email, password, riskScore = 0, approvalPhrase = null }) {
    const stmt = db.prepare(`
        INSERT INTO users (
            name, email, password, riskScore, approvalPhrase
        )
        VALUES (?, ?, ?, ?, ?)
    `);

    return stmt.run(
        name,
        email,
        password,
        riskScore,
        approvalPhrase
    );
}

// ================= FIND USER =================
function findUserByEmail(email) {
    const stmt = db.prepare(`SELECT * FROM users WHERE email = ?`);
    return stmt.get(email);
}

function findUserById(id) {
    const stmt = db.prepare(`SELECT * FROM users WHERE id = ?`);
    return stmt.get(id);
}

function findUserByResetToken(resetToken) {
    const stmt = db.prepare(`SELECT * FROM users WHERE resetToken = ?`);
    return stmt.get(resetToken);
}

// ================= FAILED ATTEMPTS / LOCKOUT (Member 2) =================
function updateFailedAttempts(userId, attempts) {
    const stmt = db.prepare(`UPDATE users SET failedAttempts = ? WHERE id = ?`);
    return stmt.run(attempts, userId);
}

function resetFailedAttempts(userId) {
    const stmt = db.prepare(`UPDATE users SET failedAttempts = 0 WHERE id = ?`);
    return stmt.run(userId);
}

function setLockUntil(userId, lockUntil) {
    const stmt = db.prepare(`UPDATE users SET lockUntil = ? WHERE id = ?`);
    return stmt.run(lockUntil, userId);
}

// ================= APPROVAL PHRASE (Member 2) =================
function updateApprovalPhrase(userId, approvalPhrase) {
    const stmt = db.prepare(`UPDATE users SET approvalPhrase = ? WHERE id = ?`);
    return stmt.run(approvalPhrase, userId);
}

// ================= LOCATION TRACKING (real location risk check) =================
function updateLastLocation(userId, location) {
    const stmt = db.prepare(`UPDATE users SET lastLocation = ? WHERE id = ?`);
    return stmt.run(location, userId);
}

// ================= TWO-FACTOR AUTH (TOTP) =================
// Secret is stored as soon as setup starts; twoFactorEnabled only flips to
// 1 once a code has actually been verified against it.
function setTwoFactorSecret(userId, secret) {
    const stmt = db.prepare(`UPDATE users SET twoFactorSecret = ?, twoFactorEnabled = 0 WHERE id = ?`);
    return stmt.run(secret, userId);
}

function enableTwoFactor(userId) {
    const stmt = db.prepare(`UPDATE users SET twoFactorEnabled = 1 WHERE id = ?`);
    return stmt.run(userId);
}

function disableTwoFactor(userId) {
    const stmt = db.prepare(`UPDATE users SET twoFactorEnabled = 0, twoFactorSecret = NULL WHERE id = ?`);
    return stmt.run(userId);
}

// ================= PASSWORD RESET (Member 1) =================
function setResetToken(email, resetToken, resetTokenExpiry) {
    const stmt = db.prepare(`
        UPDATE users
        SET resetToken = ?, resetTokenExpiry = ?
        WHERE email = ?
    `);
    return stmt.run(resetToken, resetTokenExpiry, email);
}

function updatePassword(userId, hashedPassword) {
    const stmt = db.prepare(`
        UPDATE users
        SET password = ?, resetToken = NULL, resetTokenExpiry = NULL
        WHERE id = ?
    `);
    return stmt.run(hashedPassword, userId);
}

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    findUserByResetToken,
    updateFailedAttempts,
    resetFailedAttempts,
    setLockUntil,
    updateApprovalPhrase,
    updateLastLocation,
    setResetToken,
    updatePassword,
    setTwoFactorSecret,
    enableTwoFactor,
    disableTwoFactor
};
