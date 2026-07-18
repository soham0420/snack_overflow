const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
    createUser,
    findUserByEmail,
    updateFailedAttempts,
    resetFailedAttempts,
    setLockUntil
} = require("../models/User");

const calculateRegistrationRisk = require("../services/registrationRisk");
const calculateLoginRisk = require("../services/loginRisk");

const generateSecurityInsights = require("../services/securityInsights");

const {
    createLoginRecord
} = require("../models/LoginHistory");

const {
    findTrustedDevice,
    saveTrustedDevice
} = require("../models/TrustedDevice");

const register = async (req, res) => {


console.log("===== REGISTER FUNCTION RUNNING =====");
console.log(req.body);

    try {

        const {
    email,
    password,
    typingSpeed,
    captchaPassed,
    approvalPhrase
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

        const hashedApprovalPhrase = await bcrypt.hash(
        approvalPhrase,
            10
        );

        console.log("Approval Phrase:", approvalPhrase);
console.log("Hashed Approval Phrase:", hashedApprovalPhrase);

        // Save user
        createUser(
        email,
        hashedPassword,
        risk.riskScore,
        hashedApprovalPhrase
                    );;

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
    deviceFingerprint,
    location,
    vpnDetected
} = req.body;

const loginTime = new Date().getHours();

        // Find user
        const user = findUserByEmail(email);


        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        let failedAttempts = user.failedAttempts || 0;


            // Remove expired lock
if (
    user.lockUntil &&
    new Date(user.lockUntil) <= new Date()
) {
    resetFailedAttempts(user.id);
    setLockUntil(user.id, null);
}

        // Check if account is locked
        if (
            user.lockUntil &&
            new Date(user.lockUntil) > new Date()
            ) {
            return res.status(403).json({
            message: "Account is locked. Try again later."
            });
            }


        // Check password

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );


        if (!passwordMatch) {

    const attempts = failedAttempts + 1;

    updateFailedAttempts(user.id, attempts);

    if (attempts >= 5) {

        const lockUntil = new Date(
            Date.now() + 10 * 60 * 1000
        ).toISOString();

        setLockUntil(user.id, lockUntil);

        return res.status(403).json({
            message: "Too many failed attempts. Account locked for 10 minutes."
        });
    }

    return res.status(401).json({
        message: `Invalid password. ${5 - attempts} attempts remaining.`
    });
    }

        resetFailedAttempts(user.id);
        setLockUntil(user.id, null);


        // Trusted Device Check

const existingDevice = findTrustedDevice(
    user.id,
    deviceFingerprint
);


let newDevice = false;


if (!existingDevice) {

    newDevice = true;

    saveTrustedDevice({
        userId: user.id,
        deviceFingerprint,
        deviceName: device
    });

}

        const risk = calculateLoginRisk({

    device,
    location,
    loginTime,
    failedAttempts,
    vpnDetected,
    newDevice

});

if (risk.decision === "VERIFY") {

    return res.status(403).json({

        message: "Approval required",

        verificationRequired: true,

        email: user.email,

        security: {

            riskScore: risk.riskScore,

            riskLevel: risk.riskLevel,

            reasons: risk.reasons

        }

    });

}

const insights = generateSecurityInsights({

    device,
    location,
    failedAttempts,
    vpnDetected,
    newDevice

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


const verifyApproval = async (req,res)=>{

    try{

        const {
            email,
            approvalPhrase
        } = req.body;


        const user = findUserByEmail(email);


        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }


        const phraseMatch = await bcrypt.compare(
            approvalPhrase,
            user.approvalPhrase
        );


        if(!phraseMatch){
            return res.status(401).json({
                message:"Invalid approval phrase"
            });
        }


        const token = jwt.sign(
            {
                id:user.id,
                email:user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"1h"
            }
        );


        res.json({
            message:"Approval successful",
            token
        });


    }catch(err){

        console.error(err);

        res.status(500).json({
            message:"Server Error"
        });

    }

};

module.exports = {
    register,
    login,
    verifyApproval
};