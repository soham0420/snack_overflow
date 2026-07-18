const calculateRegistrationRisk = require("../services/registrationRisk");
const calculateLoginRisk = require("../services/loginRisk");
const generateSecurityInsights = require("../services/securityInsights");


// Registration Risk API
exports.checkRegistrationRisk = (req, res) => {

    try {

        const result = calculateRegistrationRisk(req.body);

        res.json(result);

    } catch (error) {

        res.status(500).json({
            message: "Server error",
            error: error.message
        });

    }

};


// Login Risk API
exports.checkLoginRisk = (req, res) => {

    try {

        const result = calculateLoginRisk(req.body);

        res.json(result);

    } catch (error) {

        res.status(500).json({
            message: "Server error",
            error: error.message
        });

    }

};


// Security Insights API
exports.getSecurityInsights = (req, res) => {

    try {

        const result = generateSecurityInsights(req.body);

        res.json(result);

    } catch (error) {

        res.status(500).json({
            message: "Server error",
            error: error.message
        });

    }

};