// Approximates the user's location and network type from their IP address
// using a free, keyless lookup (ipwho.is) — no browser permission prompt
// needed. Falls back gracefully if the request fails, is blocked (e.g.
// offline, ad blocker), or the security fields aren't available on the
// free tier for a given IP.
//
// Returns both location and VPN status from a single request instead of
// two separate calls. Previously the app hardcoded vpnDetected to false on
// every login — this is a best-effort real check instead, but like any
// free IP-reputation lookup it isn't 100% accurate and can occasionally
// misclassify an IP either way.
export async function getLoginContext() {
    try {
        const response = await fetch("https://ipwho.is/?fields=success,city,country_code,security");
        const data = await response.json();

        if (!data || data.success === false) {
            return { location: "Unknown", vpnDetected: false };
        }

        const location = data.city ? `${data.city}, ${data.country_code}` : "Unknown";
        const vpnDetected = Boolean(data.security?.vpn || data.security?.proxy);

        return { location, vpnDetected };

    } catch (err) {
        console.warn("Location/network lookup failed:", err.message);
        return { location: "Unknown", vpnDetected: false };
    }
}
