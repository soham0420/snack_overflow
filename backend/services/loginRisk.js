function calculateLoginRisk(loginData) {

    let riskScore = 0;
    let reasons = [];

    const {
    device,
    location,
    loginTime,
    failedAttempts,
    vpnDetected,
    newDevice
} = loginData;


    // Trusted device check
if (newDevice) {
    riskScore += 30;
    reasons.push("New device detected");
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

    // Step-up verification (security phrase) is only supposed to kick in
    // once risk is genuinely elevated, and outright blocking is reserved
    // for the most extreme scores — not the same band as VERIFY.
    if (riskScore >= 85) {
        decision = "BLOCK";
    }
    else if (riskScore >= 60) {
        decision = "VERIFY";
    }
    else {
        decision = "ALLOW";
    }


   let riskLevel;

if(riskScore >= 60){
    riskLevel="HIGH";
}
else if(riskScore >=30){
    riskLevel="MEDIUM";
}
else{
    riskLevel="LOW";
}


return {
    riskScore,
    riskLevel,
    decision,
    reasons
};
}


module.exports = calculateLoginRisk;