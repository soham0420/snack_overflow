const db = require("../database/database");


function findTrustedDevice(userId, deviceFingerprint){

    const stmt = db.prepare(`
        SELECT *
        FROM trusted_devices
        WHERE userId = ?
        AND deviceFingerprint = ?
    `);

    return stmt.get(
        userId,
        deviceFingerprint
    );
}



function saveTrustedDevice({
    userId,
    deviceFingerprint,
    deviceName
}){

    const stmt = db.prepare(`
        INSERT INTO trusted_devices
        (
            userId,
            deviceFingerprint,
            deviceName,
            addedAt
        )
        VALUES (?,?,?,?)
    `);

    return stmt.run(
        userId,
        deviceFingerprint,
        deviceName,
        new Date().toISOString()
    );

}


module.exports = {
    findTrustedDevice,
    saveTrustedDevice
};