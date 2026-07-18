const jwt = require("jsonwebtoken");
const { findUserById } = require("../models/User");

const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "mysecretkey");

        // Fetch fresh user from DB (in case user was deleted or changed since token was issued)
        const user = findUserById(decoded.id);

        if (!user) {
            return res.status(401).json({ success: false, message: "User no longer exists" });
        }

        req.user = {
            id: user.id,
            name: user.name,
            email: user.email
        };

        next();

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, message: "Token expired. Please login again." });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = { protect };
