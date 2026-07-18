const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const {
    createUser,
    findUserByEmail,
    findUserById,
    findUserByResetToken,
    updateFailedAttempts,
    resetFailedAttempts,
    setLockUntil,
    setResetToken,
    updatePassword,
    updateLastLocation
} = require("../models/User");

const calculateRegistrationRisk = require("../services/registrationRisk");
const calculateLoginRisk = require("../services/loginRisk");
const generateSecurityInsights = require("../services/securityInsights");

const { createLoginRecord, getLoginHistory } = require("../models/LoginHistory");
const { findTrustedDevice, saveTrustedDevice, getTrustedDevices } = require("../models/TrustedDevice");

const sendEmail = require("../utils/sendEmail");
const { verifyTotp } = require("../utils/totp");

// ================= PENDING TOTP VERIFICATIONS =================
// Same idea as the step-up verification stash below, but for the final
// TOTP check. A user can hit this stage two ways — straight from a LOW
// risk login, or after clearing step-up approval — so both paths funnel
// into completeLoginOr2FA() below rather than each reimplementing it.
const PENDING_2FA_TTL_MS = 5 * 60 * 1000;
const pending2FA = new Map();

function stashPending2FA(email, context) {
    pending2FA.set(email, { ...context, createdAt: Date.now() });
}

function takePending2FA(email) {
    const entry = pending2FA.get(email);
    if (!entry) return null;

    pending2FA.delete(email);

    if (Date.now() - entry.createdAt > PENDING_2FA_TTL_MS) {
        return null;
    }

    return entry;
}

// ================= PENDING STEP-UP VERIFICATIONS =================
// When a login comes back as VERIFY, we can't just issue a token yet — but
// we also can't ask the frontend to hand us the risk/device context back
// again once the approval phrase is confirmed (that would mean trusting
// whatever the client claims about its own risk). Instead we hold onto the
// original login context here, keyed by email, until verifyApproval() picks
// it up. In-memory is fine for this app's scope; entries expire after 10
// minutes and are removed as soon as they're used.
const PENDING_VERIFICATION_TTL_MS = 10 * 60 * 1000;
const pendingVerifications = new Map();

function stashPendingVerification(email, context) {
    pendingVerifications.set(email, { ...context, createdAt: Date.now() });
}

function takePendingVerification(email) {
    const entry = pendingVerifications.get(email);
    if (!entry) return null;

    pendingVerifications.delete(email);

    if (Date.now() - entry.createdAt > PENDING_VERIFICATION_TTL_MS) {
        return null;
    }

    return entry;
}

// Shared by a direct ALLOW login and a successful step-up verification —
// both end in the same place: log the attempt, remember the location,
// generate insights, and issue a token.
function finalizeSuccessfulLogin(user, ctx) {
    const insights = generateSecurityInsights({
        device: ctx.device,
        location: ctx.locationStatus,
        failedAttempts: ctx.failedAttempts,
        vpnDetected: ctx.vpnDetected,
        newDevice: ctx.newDevice
    });

    createLoginRecord({
        userId: user.id,
        device: ctx.device,
        location: ctx.location,
        loginTime: ctx.loginTime,
        failedAttempts: ctx.failedAttempts,
        vpnDetected: ctx.vpnDetected,
        riskScore: ctx.risk.riskScore,
        decision: ctx.risk.decision,
        reasons: ctx.risk.reasons
    });

    if (ctx.location) {
        updateLastLocation(user.id, ctx.location);
    }

    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || "mysecretkey",
        { expiresIn: "1h" }
    );

    return {
        success: true,
        message: "Login successful",
        token,
        user: { id: user.id, name: user.name, email: user.email },
        security: {
            riskScore: ctx.risk.riskScore,
            riskLevel: ctx.risk.riskLevel,
            decision: ctx.risk.decision,
            reasons: ctx.risk.reasons,
            insights: insights.insights,
            recommendations: insights.recommendations
        }
    };
}

// The last gate before a token is ever issued. Called from both the direct
// ALLOW path and the post-step-up-approval path, so 2FA applies no matter
// which route got the user here. If the account has TOTP enabled, we hold
// the context (same "don't finalize until proven" pattern as step-up) and
// ask for a code instead of a token.
function completeLoginOr2FA(user, ctx) {
    if (user.twoFactorEnabled) {
        stashPending2FA(user.email, ctx);
        return {
            success: true,
            twoFactorRequired: true,
            message: "Enter the 6-digit code from your authenticator app.",
            email: user.email
        };
    }

    return finalizeSuccessfulLogin(user, ctx);
}

// ================= REGISTER =================
// Member 2: AI registration risk scoring + approval phrase
const register = async (req, res) => {
    try {
        const { name, email, password, typingSpeed, captchaPassed, approvalPhrase } = req.body;

        const existingUser = findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        // AI risk check on the registration attempt
        const risk = calculateRegistrationRisk({ email, typingSpeed, captchaPassed });

        // Hash password + approval phrase
        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedApprovalPhrase = approvalPhrase
            ? await bcrypt.hash(approvalPhrase, 10)
            : null;

        createUser({
            name,
            email,
            password: hashedPassword,
            riskScore: risk.riskScore,
            approvalPhrase: hashedApprovalPhrase
        });

        res.status(201).json({
            success: true,
            message: "Registration successful.",
            risk
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ================= LOGIN =================
// Member 1: base credential check + JWT
// Member 2: lockout, trusted device, AI login risk, step-up verification
const login = async (req, res) => {
    try {
        const { email, password, device, deviceFingerprint, location, vpnDetected } = req.body;
        const loginTime = new Date().getHours();

        const user = findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let failedAttempts = user.failedAttempts || 0;

        // Clear an expired lock
        if (user.lockUntil && new Date(user.lockUntil) <= new Date()) {
            resetFailedAttempts(user.id);
            setLockUntil(user.id, null);
            failedAttempts = 0;
        }

        // Check if account is currently locked
        if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
            return res.status(403).json({ success: false, message: "Account is locked. Try again later." });
        }

        // Check password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            const attempts = failedAttempts + 1;
            updateFailedAttempts(user.id, attempts);

            if (attempts >= 5) {
                const lockUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString();
                setLockUntil(user.id, lockUntil);
                return res.status(403).json({
                    success: false,
                    message: "Too many failed attempts. Account locked for 10 minutes."
                });
            }

            return res.status(401).json({
                success: false,
                message: `Invalid password. ${5 - attempts} attempts remaining.`
            });
        }

        resetFailedAttempts(user.id);
        setLockUntil(user.id, null);

        // Trusted device check
        const existingDevice = findTrustedDevice(user.id, deviceFingerprint);
        let newDevice = false;

        if (!existingDevice) {
            newDevice = true;
            saveTrustedDevice({ userId: user.id, deviceFingerprint, deviceName: device });
        }

        // Real location risk check: compare the incoming location (e.g. "Mumbai, IN")
        // against this user's last known login location. First-ever login has
        // nothing to compare against, so it's never flagged.
        let locationStatus = "same";
        if (user.lastLocation && location && user.lastLocation !== location) {
            locationStatus = "different";
        }

        // AI login risk scoring
        const risk = calculateLoginRisk({ device, location: locationStatus, loginTime, failedAttempts, vpnDetected, newDevice });

        const loginContext = { device, location, locationStatus, loginTime, failedAttempts, vpnDetected, newDevice, risk };

        // Medium/high risk -> require step-up verification instead of logging in.
        // Hold onto everything we know about this attempt so verifyApproval()
        // can finish the job once the phrase is confirmed, without having to
        // trust the frontend to resend accurate risk data.
        if (risk.decision === "VERIFY") {
            stashPendingVerification(user.email, loginContext);

            return res.status(403).json({
                success: false,
                message: "Approval required",
                verificationRequired: true,
                email: user.email,
                security: {
                    riskScore: risk.riskScore,
                    riskLevel: risk.riskLevel,
                    reasons: risk.reasons
                }
            });
        }

        // Very high risk -> block outright
        if (risk.decision === "BLOCK") {
            return res.status(403).json({
                success: false,
                message: "Login blocked due to high risk activity",
                security: {
                    riskScore: risk.riskScore,
                    riskLevel: risk.riskLevel,
                    reasons: risk.reasons
                }
            });
        }

        res.json(completeLoginOr2FA(user, loginContext));

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ================= VERIFY APPROVAL (step-up verification) =================
// Member 2: used when login risk = VERIFY
const verifyApproval = async (req, res) => {
    try {
        const { email, approvalPhrase } = req.body;

        const user = findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user.approvalPhrase) {
            return res.status(400).json({ success: false, message: "No approval phrase set for this account" });
        }

        const phraseMatch = await bcrypt.compare(approvalPhrase, user.approvalPhrase);
        if (!phraseMatch) {
            return res.status(401).json({ success: false, message: "Invalid approval phrase" });
        }

        const pending = takePendingVerification(user.email);
        if (!pending) {
            return res.status(410).json({
                success: false,
                message: "This verification has expired. Please log in again."
            });
        }

        // Same finalization as a direct ALLOW login — issues a token (or, if
        // this account has 2FA enabled, asks for a code first) and, just as
        // importantly, returns the risk reasons/insights/recommendations so
        // the dashboard has something to show after a step-up login too.
        res.json(completeLoginOr2FA(user, pending));

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ================= VERIFY 2FA (final step of login) =================
// Reached after a LOW risk login or a successful step-up approval, only if
// the account has TOTP enabled. Verifies the code against the user's saved
// secret and, if correct, finishes the login using whichever context was
// stashed by completeLoginOr2FA() above.
const verifyLogin2FA = (req, res) => {
    try {
        const { email, code } = req.body;

        const user = findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user.twoFactorEnabled) {
            return res.status(400).json({ success: false, message: "Two-factor authentication is not enabled for this account" });
        }

        if (!code || !verifyTotp(user.twoFactorSecret, code)) {
            return res.status(401).json({ success: false, message: "Invalid or expired code" });
        }

        const pending = takePending2FA(user.email);
        if (!pending) {
            return res.status(410).json({
                success: false,
                message: "This login attempt has expired. Please log in again."
            });
        }

        res.json(finalizeSuccessfulLogin(user, pending));

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ================= FORGOT PASSWORD =================
// Member 1's flow
const forgotPassword = (req, res) => {
    try {
        const { email } = req.body;

        const user = findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();

        setResetToken(email, resetToken, resetTokenExpiry);

        // Not wired to a real email provider yet — logged for now instead of
        // returned in the API response, so the token only reaches the person
        // who actually controls the inbox (or, in dev, whoever can see the
        // server console) rather than anyone who can call this endpoint.
        sendEmail(email, "Reset your SecureAuth password", `Your reset token is ${resetToken}`);

        res.json({
            success: true,
            message: "Password reset token generated. Check your email for the reset link."
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ================= RESET PASSWORD =================
// Member 1's flow
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const user = findUserByResetToken(token);
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }

        if (new Date(user.resetTokenExpiry) < new Date()) {
            return res.status(400).json({ success: false, message: "Reset token has expired. Please request a new one." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        updatePassword(user.id, hashedPassword);

        res.json({ success: true, message: "Password reset successful. Please login with your new password." });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ================= DASHBOARD OVERVIEW =================
// Everything the security dashboard needs that isn't already handed back at
// login time: trusted devices, recent login history, and current account
// lock / failed-attempt status. Scoped to req.user.id from the auth token,
// so this is always the calling user's own data.
const getDashboard = (req, res) => {
    try {
        const user = findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isLocked = Boolean(user.lockUntil && new Date(user.lockUntil) > new Date());

        res.json({
            success: true,
            account: {
                failedAttempts: user.failedAttempts || 0,
                isLocked,
                lockUntil: isLocked ? user.lockUntil : null,
                twoFactorEnabled: Boolean(user.twoFactorEnabled)
            },
            trustedDevices: getTrustedDevices(user.id),
            loginHistory: getLoginHistory(user.id).map(record => ({
                ...record,
                reasons: JSON.parse(record.reasons || "[]")
            }))
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {
    register,
    login,
    verifyApproval,
    verifyLogin2FA,
    forgotPassword,
    resetPassword,
    getDashboard
};
