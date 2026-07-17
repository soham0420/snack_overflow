const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
    createUser,
    findUserByEmail
} = require("../models/User");

const calculateRegistrationRisk = require("../services/registrationRisk");
const calculateLoginRisk = require("../services/loginRisk");

const generateSecurityInsights = require("../services/securityInsights");

const {
    createLoginRecord
} = require("../models/LoginHistory");

const register = async (req, res) => {

console.log(req.body);

    try {

        const {
            email,
            password,
            typingSpeed,
            captchaPassed
        } = req.body;

        // Check if user already exists
        const existingUser = findUserByEmail(email);

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Calculate AI Risk
        const risk = calculateRegistrationRisk({
            email,
            typingSpeed,
            captchaPassed
        });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user
        createUser(email, hashedPassword, risk.riskScore);

        res.status(201).json({
            message: "User registered successfully",
            risk
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

const login = async (req, res) => {

    try {

        const {
    email,
    password,
    device,
    location,
    vpnDetected
} = req.body;

const failedAttempts = 0;
const loginTime = new Date().getHours();

        // Find user
        const user = findUserByEmail(email);


        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }


        // Check password

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );


        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        const risk = calculateLoginRisk({

    device,
    location,
    loginTime,
    failedAttempts,
    vpnDetected

});


const insights = generateSecurityInsights({

    device,
    location,
    failedAttempts,
    vpnDetected

});


createLoginRecord({

    userId: user.id,

    device,

    location,

    loginTime,

    failedAttempts,

    vpnDetected,

    riskScore: risk.riskScore,

    decision: risk.decision,

    reasons: risk.reasons

});

        // Create JWT token

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );


        res.json({

    message: "Login successful",

    token,

    security: {

        riskScore: risk.riskScore,

        riskLevel: risk.riskLevel,

        decision: risk.decision,

        reasons: risk.reasons,

        insights: insights.insights,

        recommendations: insights.recommendations

    },

    user: {

        email: user.email

    }

});


    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

module.exports = {
    register,
    login
};