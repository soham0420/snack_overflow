const mongoose = require("mongoose");


const loginHistorySchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true
    },

    device: {
        type: String
    },

    location: {
        type: String
    },

    loginTime: {
        type: Date,
        default: Date.now
    },

    failedAttempts: {
        type: Number,
        default: 0
    },

    vpnDetected: {
        type: Boolean,
        default: false
    },

    riskScore: {
        type: Number
    },

    decision: {
        type: String
    },

    reasons: [
        String
    ]

});


module.exports = mongoose.model(
    "LoginHistory",
    loginHistorySchema
);