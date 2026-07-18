const bcrypt = require("bcryptjs");
const db = require("../database/db");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

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
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET || "mysecretkey",
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
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
  try {
    const { email } = req.body;

    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Token expires in 15 minutes
    const resetTokenExpiry = new Date(
      Date.now() + 15 * 60 * 1000
    ).toISOString();

    // Save token
    db.prepare(`
      UPDATE users
      SET resetToken = ?, resetTokenExpiry = ?
      WHERE email = ?
    `).run(resetToken, resetTokenExpiry, email);

    console.log("Reset Token:", resetToken);

    res.status(200).json({
      success: true,
      message: "Password reset token generated",
      resetToken,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = db
      .prepare("SELECT * FROM users WHERE resetToken = ?")
      .get(token);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Check token hasn't expired
    const isExpired = new Date(user.resetTokenExpiry) < new Date();

    if (isExpired) {
      return res.status(400).json({
        success: false,
        message: "Reset token has expired. Please request a new one.",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Save new password, clear reset token fields
    db.prepare(`
      UPDATE users
      SET password = ?, resetToken = NULL, resetTokenExpiry = NULL
      WHERE id = ?
    `).run(hashedPassword, user.id);

    res.status(200).json({
      success: true,
      message: "Password reset successful. Please login with your new password.",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
};