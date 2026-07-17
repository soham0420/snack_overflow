const calculateLoginRisk = require("./services/loginRisk");
const generateSecurityInsights = require("./services/securityInsights");


const loginData = {

    device: "new",

    location: "different",

    loginTime: 3,

    failedAttempts: 4,

    vpnDetected: true

};



const risk = calculateLoginRisk(loginData);


console.log("Risk Result:");
console.log(risk);



const insights = generateSecurityInsights(loginData);


console.log("Security Insights:");
console.log(insights);