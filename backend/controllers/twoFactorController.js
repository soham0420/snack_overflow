const bcrypt = require("bcryptjs");
const QRCode = require("qrcode");

const { generateSecret, verifyTotp, buildOtpauthUrl } = require("../utils/totp");
const {
    findUserById,
    setTwoFactorSecret,
    enableTwoFactor,
    disableTwoFactor
} = require("../models/User");

// ================= START 2FA SETUP =================
// Protected: the logged-in user is asking to turn on 2FA. Generates a fresh
// secret, saves it (not yet enabled), and hands back everything an
// authenticator app needs — both as a scannable QR code and a manual key
// for apps/devices that can't scan.
const setup2FA = async (req, res) => {
    try {
        const user = findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.twoFactorEnabled) {
            return res.status(400).json({ success: false, message: "Two-factor authentication is already enabled" });
        }

        const secret = generateSecret();
        setTwoFactorSecret(user.id, secret);

        const otpauthUrl = buildOtpauthUrl(secret, { accountName: user.email });
        const qrCode = await QRCode.toDataURL(otpauthUrl);

        res.json({
            success: true,
            message: "Scan the QR code with your authenticator app, then verify a code to finish enabling 2FA",
            manualEntryKey: secret,
            otpauthUrl,
            qrCode
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ================= CONFIRM 2FA SETUP =================
// Protected: user submits a code from their app. Proves they actually
// scanned/entered the secret correctly before we switch 2FA on.
const verifySetup2FA = (req, res) => {
    try {
        const { code } = req.body;
        const user = findUserById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user.twoFactorSecret) {
            return res.status(400).json({ success: false, message: "2FA setup not started. Call /2fa/setup first." });
        }

        if (!code || !verifyTotp(user.twoFactorSecret, code)) {
            return res.status(400).json({ success: false, message: "Invalid code. Please try again." });
        }

        enableTwoFactor(user.id);

        res.json({ success: true, message: "Two-factor authentication is now enabled" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ================= DISABLE 2FA =================
// Protected: requires the account password again (not just the JWT) so a
// stolen/leftover session on a shared device can't silently turn off 2FA.
const disable2FA = async (req, res) => {
    try {
        const { password } = req.body;
        const user = findUserById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user.twoFactorEnabled) {
            return res.status(400).json({ success: false, message: "Two-factor authentication is not enabled" });
        }

        const passwordMatch = password && await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: "Incorrect password" });
        }

        disableTwoFactor(user.id);

        res.json({ success: true, message: "Two-factor authentication has been disabled" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {
    setup2FA,
    verifySetup2FA,
    disable2FA
};
