const userModel = require("../model/usermodel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../config/nodemailer");

// ================= COOKIE OPTIONS =================

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
};

// clearCookie ke liye maxAge nahi chahiye
const clearCookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax"
};

const createToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};


// ================= REGISTER =================

async function registerUser(req, res) {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters"
        });
    }

    try {

        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            name,
            email,
            password: hashedPassword
        });

        const token = createToken(user._id);

        res.cookie("token", token, cookieOptions);

        // mail fail ho jaye to bhi register fail nahi hona chahiye
        try {
            await transporter.sendMail({
                from: process.env.SENDER_EMAIL,
                to: email,
                subject: "Welcome to GreatStack",
                text: `Hello ${name}, your account has been successfully created with email ${email}`
            });
        } catch (mailError) {
            console.log("Welcome mail failed:", mailError.message);
        }

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            token
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


// ================= LOGIN =================

async function login(req, res) {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and Password are required"
        });
    }

    try {

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = createToken(user._id);

        res.cookie("token", token, cookieOptions);

        return res.json({
            success: true,
            message: "Login successful",
            token
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


// ================= LOGOUT =================

async function logout(req, res) {

    try {

        // cookie ho ya na ho, clear kar do (header-based users ke liye bhi kaam kare)
        res.clearCookie("token", clearCookieOptions);

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


// ================= SEND VERIFICATION OTP =================

async function sendVerificationOtp(req, res) {

    try {

        const userId = req.userId;

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isAccountVerified) {
            return res.json({
                success: false,
                message: "Account already verified"
            });
        }

        const otp = String(
            Math.floor(100000 + Math.random() * 900000)
        );

        user.verifyOtp = otp;

        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();

        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Account Verification OTP",
            text: `Your OTP is ${otp}. Verify your account using this OTP.`
        });

        return res.json({
            success: true,
            message: "Verification OTP sent to your email"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


// ================= VERIFY EMAIL =================

async function verifyEmail(req, res) {

    const { otp } = req.body;

    const userId = req.userId;

    if (!otp) {
        return res.json({
            success: false,
            message: "OTP required"
        });
    }

    try {

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        const enteredOtp = String(otp).trim();

        if (!user.verifyOtp || user.verifyOtp !== enteredOtp) {
            return res.json({
                success: false,
                message: "Invalid OTP"
            });
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({
                success: false,
                message: "OTP expired"
            });
        }

        user.isAccountVerified = true;
        user.verifyOtp = "";
        user.verifyOtpExpireAt = 0;

        await user.save();

        return res.json({
            success: true,
            message: "Email verified successfully"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


// ================= CHECK AUTH =================

async function isAuthenticated(req, res) {

    try {

        return res.json({
            success: true
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


// ================= SEND RESET OTP =================

async function sendResetOtp(req, res) {

    const { email } = req.body;

    if (!email) {
        return res.json({
            success: false,
            message: "Email is required"
        });
    }

    try {

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        const otp = String(
            Math.floor(100000 + Math.random() * 900000)
        );

        user.resetOtp = otp;

        user.resetOtpExpireAt = Date.now() + 14 * 60 * 1000;

        await user.save();

        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Password Reset OTP",
            text: `Your OTP for resetting your password is ${otp}. Use this OTP to proceed with resetting your password.`
        });

        return res.json({
            success: true,
            message: "OTP sent to your email"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


// ================= RESET PASSWORD =================

async function resetPassword(req, res) {

    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.json({
            success: false,
            message: "Email, OTP, and new password are required"
        });
    }

    if (newPassword.length < 6) {
        return res.json({
            success: false,
            message: "Password must be at least 6 characters"
        });
    }

    try {

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        const enteredOtp = String(otp).trim();

        if (!user.resetOtp || user.resetOtp !== enteredOtp) {
            return res.json({
                success: false,
                message: "Invalid OTP"
            });
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({
                success: false,
                message: "OTP expired"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        user.resetOtp = "";
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({
            success: true,
            message: "Password has been reset successfully"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


module.exports = {
    registerUser,
    login,
    logout,
    sendVerificationOtp,
    verifyEmail,
    isAuthenticated,
    sendResetOtp,
    resetPassword
};