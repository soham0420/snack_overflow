const calculateLoginRisk = require("./services/loginRisk");


const loginAttempt = {
    device: "new",
    location: "different",
    loginTime: 2,
    failedAttempts: 4,
    vpnDetected: true
};


const result = calculateLoginRisk(loginAttempt);


console.log(result);