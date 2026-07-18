const express = require("express");
const router = express.Router();

const {
    register,
    login,
    verifyApproval,
    verifyLogin2FA,
    forgotPassword,
    resetPassword,
    getDashboard
} = require("../controllers/authController");

const {
    setup2FA,
    verifySetup2FA,
    disable2FA
} = require("../controllers/twoFactorController");

const {
    registerValidation,
    resetPasswordValidation,
    validate
} = require("../utils/passwordValidator");

const { protect } = require("../middleware/authMiddleware");

// Test route
router.get("/", (req, res) => {
    res.json({ success: true, message: "Authentication routes are working!" });
});

// Registration (Member 1)
router.post("/register", registerValidation, validate, register);

// Login + step-up verification (Member 1 base + Member 2 risk logic)
router.post("/login", login);
router.post("/verify-approval", verifyApproval);

// Final step of login when the account has TOTP 2FA enabled
router.post("/2fa/verify-login", verifyLogin2FA);

// Managing 2FA itself, from the logged-in dashboard (protected)
router.post("/2fa/setup", protect, setup2FA);
router.post("/2fa/verify-setup", protect, verifySetup2FA);
router.post("/2fa/disable", protect, disable2FA);

// Password reset (Member 1)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPasswordValidation, validate, resetPassword);

// Protected test route
router.get("/profile", protect, (req, res) => {
    res.json({ success: true, message: "Token verified successfully", user: req.user });
});

// Dashboard data: trusted devices, login history, account lock status (Member 2)
router.get("/dashboard", protect, getDashboard);

module.exports = router;
