const bcrypt = require("bcryptjs");
const db = require("../database/db");

// Register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 6-digit OTP
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // OTP expires in 10 minutes
    const verificationTokenExpiry = new Date(
      Date.now() + 10 * 60 * 1000
    ).toISOString();

    // Save user
    db.prepare(`
      INSERT INTO users
      (name, email, password, verificationToken, verificationTokenExpiry)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      name,
      email,
      hashedPassword,
      verificationToken,
      verificationTokenExpiry
    );

    console.log("Verification OTP:", verificationToken);

    res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email.",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Login
const login = (req, res) => {
  res.json({
    success: true,
    message: "Login API coming soon",
  });
};

// Verify Email
const verifyEmail = (req, res) => {
  res.json({
    success: true,
    message: "Verify Email API coming soon",
  });
};

// Forgot Password
const forgotPassword = (req, res) => {
  res.json({
    success: true,
    message: "Forgot Password API coming soon",
  });
};

// Reset Password
const resetPassword = (req, res) => {
  res.json({
    success: true,
    message: "Reset Password API coming soon",
  });
};

module.exports = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
};