const generateSecurityInsights = require("./services/securityInsights");


const securityData = {
    vpn: true,
    newDevice: false,
    failedAttempts: 4
};


const result = generateSecurityInsights(securityData);


console.log(result);