function generateSecurityInsights(data) {

    let insights = [];
    let recommendations = [];


    // Device status
if (data.newDevice) {

    insights.push("New Device Detected ❌");
    recommendations.push("Review active sessions");

}
else {

    insights.push("Known Device ✅");

}


    // Location status
    if (data.location === "different") {

        insights.push("Different location detected ❌");
        recommendations.push("Verify login location");

    }
    else {

        insights.push("Known Location ✅");

    }


    // VPN status
    if (data.vpnDetected) {

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