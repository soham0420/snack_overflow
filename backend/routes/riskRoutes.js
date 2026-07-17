const express = require("express");

const router = express.Router();

const {
    checkRegistrationRisk,
    checkLoginRisk,
    getSecurityInsights
} = require("../controllers/riskController");


// Registration risk endpoint
router.post(
    "/register-risk",
    checkRegistrationRisk
);


// Login risk endpoint
router.post(
    "/login-risk",
    checkLoginRisk
);


// Security insights endpoint
router.post(
    "/security-insights",
    getSecurityInsights
);


module.exports = router;