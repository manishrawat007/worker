const express = require('express')
const User = require('../models/users')
const bcrypt = require('bcrypt')
const { auth } = require('../middleware/adminAuth')
const multer = require('multer');
const path = require('path');
const sendEmail = require('../utility/sendEmail')

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
            secure: false,
            sameSite: 'Lax',
        });
        res.send("Login Successfully")
    } catch (err) {
        res.status(400).send(err.message)
    }
})

//Sign Up api

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
}).fields([
    { name: "profilePic", maxCount: 1 },
    { name: "coverPic", maxCount: 1 }
]);

const OTP_EXPIRATION = 5 * 60 * 1000;
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

authRouter.post('/signup', upload, async (req, res) => {
    try {
        const { firstName, lastName, email, password, age, gender, bio, skills } = req.body
        await User.deleteOne({ email, isVerified: false });
        const profileurl = req.files["profilePic"] ? `${req.protocol}://${req.get('host')}/uploads/${req.files["profilePic"][0].filename}` : null;
        const coverurl = req.files["coverPic"] ? `${req.protocol}://${req.get('host')}/uploads/${req.files["coverPic"][0].filename}` : null;

        if (!profileurl && !coverurl && !email && !password && !firstName) {
            throw new Error("All fields are required");
        }

        const passwordHash = await bcrypt.hash(password, 10)
        const otp = generateOTP();
        const otpExpiresAt = Date.now() + OTP_EXPIRATION
        const user = new User({ firstName, lastName, email, password: passwordHash, age, gender, profile: profileurl, cover: coverurl, bio, skills, otp, otpExpiresAt })
        const newUser = await user.save()
        await sendEmail(user.email, "Your OTP for Verification", `Your OTP is: ${otp}. It expires in 5 minutes.`)
        res.status(201).json({ message: `Otp is send on the ${newUser.email}` })

    } catch (err) {
        res.status(400).send(err.message)
    }
})

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