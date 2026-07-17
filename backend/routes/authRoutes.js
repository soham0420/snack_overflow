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
router.post("/reset-password", resetPassword);

module.exports = router;