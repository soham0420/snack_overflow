const mongoose = require("mongoose");


const securityAlertSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true
    },

    alertType: {
        type: String,
        required: true
    },

    severity: {
        type: String,
        enum: [
            "LOW",
            "MEDIUM",
            "HIGH"
        ],
        default: "LOW"
    },

    message: {
        type: String
    },

    riskScore: {
        type: Number
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    resolved: {
        type: Boolean,
        default: false
    }

});


module.exports = mongoose.model(
    "SecurityAlert",
    securityAlertSchema
);