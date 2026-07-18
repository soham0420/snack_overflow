const db = require("../database/database");

// ================= CREATE USER =================

function createUser(email, password, riskScore = 0, approvalPhrase = null) {

    const stmt = db.prepare(`
        INSERT INTO users (
            email,
            password,
            riskScore,
            approvalPhrase
        )
        VALUES (?, ?, ?, ?)
    `);

    return stmt.run(
        email,
        password,
        riskScore,
        approvalPhrase
    );
}

// ================= FIND USER =================

function findUserByEmail(email) {

    const stmt = db.prepare(`
        SELECT * FROM users
        WHERE email = ?
    `);

    return stmt.get(email);
}

// ================= FAILED ATTEMPTS =================

function updateFailedAttempts(userId, attempts) {

    const stmt = db.prepare(`
        UPDATE users
        SET failedAttempts = ?
        WHERE id = ?
    `);

    return stmt.run(attempts, userId);
}

function resetFailedAttempts(userId) {

    const stmt = db.prepare(`
        UPDATE users
        SET failedAttempts = 0
        WHERE id = ?
    `);

    return stmt.run(userId);
}

// ================= ACCOUNT LOCK =================

function setLockUntil(userId, lockUntil) {

    const stmt = db.prepare(`
        UPDATE users
        SET lockUntil = ?
        WHERE id = ?
    `);

    return stmt.run(lockUntil, userId);
}

// ================= SECURITY PHRASE =================

function updateapprovalPhrase(userId, approvalPhrase) {

    const stmt = db.prepare(`
        UPDATE users
        SET approvalPhrase = ?
        WHERE id = ?
    `);

    return stmt.run(approvalPhrase, userId);
}

module.exports = {

    createUser,

    findUserByEmail,

    updateFailedAttempts,

    resetFailedAttempts,

    setLockUntil,

    updateapprovalPhrase

};