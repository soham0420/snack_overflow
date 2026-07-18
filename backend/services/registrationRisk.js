function calculateRegistrationRisk(userData) {

    let riskScore = 0;
    let reasons = [];

    const {
        email,
        typingSpeed,
        captchaPassed
    } = userData;


    // 1. Check email domain
    const disposableDomains = [
        "tempmail.com",
        "10minutemail.com",
        "mailinator.com"
    ];

    const emailDomain = email.split("@")[1];


    if (disposableDomains.includes(emailDomain)) {
        riskScore += 40;
        reasons.push("Disposable email");
    }


    // 2. Check typing speed
    if (typingSpeed < 50) {
        riskScore += 30;
        reasons.push("Bot-like typing");
    }


    // 3. CAPTCHA check
    if (!captchaPassed) {
        riskScore += 30;
        reasons.push("Captcha failed");
    }


    // Decide risk level

    let riskLevel;

    if (riskScore >= 70) {
        riskLevel = "HIGH";
    }
    else if (riskScore >= 40) {
        riskLevel = "MEDIUM";
    }
    else {
        riskLevel = "LOW";
    }


    return {
        riskScore,
        riskLevel,
        reasons
    };
}


module.exports = calculateRegistrationRisk;