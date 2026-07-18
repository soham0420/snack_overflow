const jwt = require("jsonwebtoken");
const db = require("../database/db");

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Expect header format: "Bearer <token>"
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mysecretkey");

    // Fetch fresh user from DB (in case user was deleted, or data changed since token was issued)
    const user = db
      .prepare("SELECT id, name, email, isVerified FROM users WHERE id = ?")
      .get(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    // Attach user to request for use in protected routes
    req.user = user;

    next();

  } catch (error) {
    // jwt.verify throws for expired or malformed tokens
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = { protect };