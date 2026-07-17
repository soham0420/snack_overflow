function generateSecurityInsights(data) {

    let insights = [];
    let recommendations = [];


    // Device status
    if (data.newDevice) {
        insights.push("Unknown Device ❌");
        recommendations.push("Review active sessions");
    }
    else {
        insights.push("Known Device ✅");
    }


    // VPN status
    if (data.vpn) {
        insights.push("VPN Detected ❌");
        recommendations.push("Enable MFA");
    }
    else {
        insights.push("No VPN detected ✅");
    }


    // Failed attempts
    if (data.failedAttempts >= 3) {
        insights.push("Multiple failed login attempts ❌");
        recommendations.push("Reset password");
    }


    return {
        insights,
        recommendations
    };
}


module.exports = generateSecurityInsights;