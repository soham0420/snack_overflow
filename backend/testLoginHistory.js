const { createLoginRecord } = require("./models/LoginHistory");


createLoginRecord({

    userId: 1,

    device: "new",

    location: "different",

    loginTime: "03:00",

    failedAttempts: 4,

    vpnDetected: true,

    riskScore: 85,

    decision: "BLOCK",

    reasons: [
        "Unknown device",
        "VPN detected"
    ]

});


console.log("Login record inserted");