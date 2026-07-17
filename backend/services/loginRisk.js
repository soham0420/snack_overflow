function calculateLoginRisk(loginData) {

    let riskScore = 0;
    let reasons = [];

    const {
        device,
        location,
        loginTime,
        failedAttempts,
        vpnDetected
    } = loginData;


    // New device check
    if (device === "new") {
        riskScore += 30;
        reasons.push("Unknown device");
    }


    // Different location check
    if (location === "different") {
        riskScore += 20;
        reasons.push("Different location");
    }


    // Late night login check
    if (loginTime >= 0 && loginTime < 5) {
        riskScore += 15;
        reasons.push("Late night login");
    }


    // VPN detection
    if (vpnDetected) {
        riskScore += 20;
        reasons.push("VPN detected");
    }


    // Failed attempts
    if (failedAttempts >= 3) {
        riskScore += 30;
        reasons.push("Multiple failed attempts");
    }


    let decision;

    if (riskScore >= 60) {
        decision = "BLOCK";
    }
    else if (riskScore >= 30) {
        decision = "VERIFY";
    }
    else {
        decision = "ALLOW";
    }


    return {
        riskScore,
        decision,
        reasons
    };
}


module.exports = calculateLoginRisk;