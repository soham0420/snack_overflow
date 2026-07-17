const db = require("../database/database");

function createUser(email, password, riskScore = 0) {
    const stmt = db.prepare(`
        INSERT INTO users (email, password, riskScore)
        VALUES (?, ?, ?)
    `);

    return stmt.run(email, password, riskScore);
}

function findUserByEmail(email) {
    const stmt = db.prepare(`
        SELECT * FROM users WHERE email = ?
    `);

    return stmt.get(email);
}

module.exports = {
    createUser,
    findUserByEmail
};