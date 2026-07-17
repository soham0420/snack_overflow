const db = require("../database/database");


db.exec(`
CREATE TABLE IF NOT EXISTS LoginHistory (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    userId INTEGER,

    device TEXT,

    location TEXT,

    loginTime TEXT,

    failedAttempts INTEGER DEFAULT 0,

    vpnDetected INTEGER DEFAULT 0,

    riskScore INTEGER,

    decision TEXT,

    reasons TEXT

);
`);



function createLoginRecord(data){

    const stmt = db.prepare(`
        INSERT INTO LoginHistory
        (
            userId,
            device,
            location,
            loginTime,
            failedAttempts,
            vpnDetected,
            riskScore,
            decision,
            reasons
        )

        VALUES (?,?,?,?,?,?,?,?,?)
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
        JSON.stringify(data.reasons)
    );

}



function getLoginHistory(userId){

    const stmt = db.prepare(`
        SELECT *
        FROM LoginHistory
        WHERE userId = ?
        ORDER BY id DESC
    `);


    return stmt.all(userId);

}



module.exports = {
    createLoginRecord,
    getLoginHistory
};