const express = require("express");
const router = express.Router();

const {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const {
  setup2FA,
  verifySetup2FA,
  verifyLogin2FA,
} = require("../controllers/twoFactorController");

const {
  registerValidation,
  resetPasswordValidation,
  validate,
} = require("../utils/passwordValidator");

// Test Route
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Authentication routes are working!",
  });
});

// Authentication Routes
router.post("/register", registerValidation, validate, register);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPasswordValidation, validate, resetPassword);

// Protected Test Route
router.get("/profile", protect, (req, res) => {
  res.json({
    success: true,
    message: "Token verified successfully",
    user: req.user,
  });
});

// Two-Factor Authentication Routes
router.post("/2fa/setup", protect, setup2FA);
router.post("/2fa/verify-setup", protect, verifySetup2FA);
router.post("/2fa/login-verify", verifyLogin2FA);

module.exports = router;