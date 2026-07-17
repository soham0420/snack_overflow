const mongoose = require("mongoose");


const activeSessionSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true
    },

    device: {
        type: String
    },

    ipAddress: {
        type: String
    },

    location: {
        type: String
    },

    loginTime: {
        type: Date,
        default: Date.now
    },

    lastActive: {
        type: Date,
        default: Date.now
    },

    isActive: {
        type: Boolean,
        default: true
    }

});


module.exports = mongoose.model(
    "ActiveSession",
    activeSessionSchema
);