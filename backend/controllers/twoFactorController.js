const jwt = require("jsonwebtoken");
const db = require("../database/db");
const { generateSecret, verifyTotp, buildOtpauthUrl } = require("../utils/totp");

// Step 1: Generate a secret for the logged-in user to add to their authenticator app
const setup2FA = (req, res) => {
  try {
    const userId = req.user.id;

    // Generate a new TOTP secret for this user (hand-rolled, RFC 6238)
    const secret = generateSecret();

    // Save the secret temporarily — not enabled yet until they verify a code
    db.prepare(`
      UPDATE users
      SET twoFactorSecret = ?, twoFactorEnabled = 0
      WHERE id = ?
    `).run(secret, userId);

    const otpauthUrl = buildOtpauthUrl(secret, { accountName: req.user.email });

    res.status(200).json({
      success: true,
      message: "Add this to your authenticator app, then verify a code to enable 2FA",
      manualEntryKey: secret,
      otpauthUrl, // paste this into an authenticator app's "manual/URI entry" option
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Step 2: User enters a code from their app to confirm setup works, this turns 2FA ON
const verifySetup2FA = (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

    if (!user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: "2FA setup not started. Call /2fa/setup first.",
      });
    }

    const isValid = verifyTotp(user.twoFactorSecret, code);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid code. Please try again.",
      });
    }

    // Code is correct — officially turn on 2FA
    db.prepare("UPDATE users SET twoFactorEnabled = 1 WHERE id = ?").run(userId);

    res.status(200).json({
      success: true,
      message: "Two-factor authentication enabled successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Step 3: Used during login, after password is correct, if 2FA is enabled
const verifyLogin2FA = (req, res) => {
  try {
    const { email, code } = req.body;

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: "2FA is not enabled for this account",
      });
    }

    const isValid = verifyTotp(user.twoFactorSecret, code);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired code",
      });
    }

    // Code correct — now issue the real JWT (mirrors your normal login response)
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "1d" }
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

module.exports = {
  setup2FA,
  verifySetup2FA,
  verifyLogin2FA,
};