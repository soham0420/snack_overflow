const db = require("../database");


function saveDevice({
    userId,
    deviceFingerprint,
    deviceName
}){

const stmt = db.prepare(`
INSERT INTO devices
(
userId,
deviceFingerprint,
deviceName,
createdAt,
lastLogin
)

VALUES
(?,?,?,?,?)
`);

return stmt.run(
userId,
deviceFingerprint,
deviceName,
new Date().toISOString(),
new Date().toISOString()
);

}



function findDevice(
userId,
deviceFingerprint
){

const stmt = db.prepare(`
SELECT *
FROM devices
WHERE userId = ?
AND deviceFingerprint = ?
`);

return stmt.get(
userId,
deviceFingerprint
);

}


module.exports = {
saveDevice,
findDevice
};