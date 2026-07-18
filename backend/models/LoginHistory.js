const db = require("../database/database");

// The login_history table itself is created centrally in database.js
// (this file used to also run its own CREATE TABLE for a differently-named
// "LoginHistory" table, which silently created a second, never-queried
// table instead of the real one — removed).


function createLoginRecord(data){

    const stmt = db.prepare(`
        INSERT INTO login_history
        (
            userId,
            device,
            location,
            loginTime,
            failedAttempts,
            vpnDetected,
            riskScore,
            decision,
            reasons,
            createdAt
        )

        VALUES (?,?,?,?,?,?,?,?,?,?)
    `);


    stmt.run(
        data.userId,
        data.device,
        data.location,
        data.loginTime,
        data.failedAttempts,
        data.vpnDetected ? 1 : 0,
        data.riskScore,
        data.decision,
        JSON.stringify(data.reasons),
        new Date().toISOString()
    );

}



function getLoginHistory(userId){

    const stmt = db.prepare(`
        SELECT *
        FROM login_history
        WHERE userId = ?
        ORDER BY id DESC
    `);


    return stmt.all(userId);

}



module.exports = {
    createLoginRecord,
    getLoginHistory
};