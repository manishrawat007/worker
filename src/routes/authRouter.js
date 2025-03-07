const express = require('express')
const User = require('../models/users')
const bcrypt = require('bcrypt')
const { auth } = require('../middleware/adminAuth')
const sendEmail = require('../utility/sendEmail');
const upload = require('../utility/multer');

const authRouter = express.Router()

//login api
authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email: email })
        if (!user) {
            throw new Error("Invalid Credentials");
        }
        if (!user.emailVerified) {
            throw new Error("User account is not verified");
        }
        const ispassword = await bcrypt.compare(password, user.password)
        if (!ispassword) {
            throw new Error("Invalid Credentials");
        }
        const token = await user.getToken()
        res.cookie('token', token, {
            // secure: false,
            // sameSite: 'Lax',
            httpOnly: true,
            secure: true,
            sameSite: "None",
            path: "/",
            maxAge: 24 * 60 * 60 * 1000
        });
        res.send("Login Successfully")
    } catch (err) {
        res.status(400).send(err.message)
    }
})

//Sign Up api
const OTP_EXPIRATION = 5 * 60 * 1000;
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

authRouter.post('/signup', upload, async (req, res) => {
    try {
        const { firstName, lastName, email, password, age, gender, bio, skills } = req.body;

        if (!email || !password || !firstName) {
            throw new Error("Email, password, and first name are required.");
        }

        const profileurl = req.files?.profilePic?.[0]
            ? `${req.protocol}://${req.get('host')}/uploads/${req.files["profilePic"][0].filename}`
            : null;

        const coverurl = req.files?.coverPic?.[0]
            ? `${req.protocol}://${req.get('host')}/uploads/${req.files["coverPic"][0].filename}`
            : null;

        const existingUser = await User.findOne({ email });

        // 🔹 If user exists and is verified, return an error
        if (existingUser?.isVerified) {
            return res.status(400).json({ message: "User already exists and is verified." });
        }

        const otp = generateOTP();
        const otpExpiresAt = Date.now() + OTP_EXPIRATION;
        const passwordHash = await bcrypt.hash(password, 10);

        // 🔹 Upsert user (create new or update existing unverified user)
        const updatedUser = await User.findOneAndUpdate(
            { email },
            {
                firstName,
                lastName,
                email,
                password: passwordHash,
                age,
                gender,
                profile: profileurl || existingUser?.profile || null,
                cover: coverurl || existingUser?.cover || null,
                bio,
                skills,
                otp,
                otpExpiresAt,
                isVerified: false,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await sendEmail(updatedUser.email, "Your OTP for Verification", `Your OTP is: ${otp}. It expires in 5 minutes.`);

        res.status(201).json({ message: `OTP sent to ${updatedUser.email}` });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// verify otp
authRouter.post("/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        if (user.otp !== otp || Date.now() > user.otpExpiresAt) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        user.emailVerified = true;
        user.otp = null;
        user.otpExpiresAt = null;
        await user.save();

        res.json({ message: "OTP verified successfully. Account activated." });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

//Delete a user accout
authRouter.delete('/user/:id', auth, async (req, res) => {
    const id = req.params.id
    try {
        await User.findByIdAndDelete(id)
        res.send("User Details Deleted Successfully")
    } catch (err) {
        res.status(500).send("something went wrong--------" + err.message)
    }
})

// logout api 
authRouter.post('/logout', async (req, res) => {
    try {
        res.cookie("token", '', { expireIn: '0d' })
        res.send("Logout Successfull")
    } catch {
        res.send("Error in Logout")
    }
})

module.exports = authRouter