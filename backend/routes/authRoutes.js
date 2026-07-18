const express = require("express");
const router = express.Router();

const {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const {
  registerValidation,
  resetPasswordValidation,
  validate,
} = require("../utils/passwordValidator");

const { protect } = require("../middleware/authMiddleware");

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

module.exports = router;
