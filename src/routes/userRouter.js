const express = require('express')
const userRouter = express.Router()
const User = require('../models/users')
const { auth } = require('../middleware/adminAuth')
const bcrypt = require('bcrypt')
const ConnectionRequest = require('../models/connections')
const upload = require('../utility/multer')

// get all user api
userRouter.get('/users', auth, async (req, res) => {
    try {
        //remove the self user from feed
        // remove the users who send request to login user or login user send request to other
        const limit = req.query.limit || 20
        const page = req.query.page || 1
        const skip = (page - 1) * limit

        const connection = await ConnectionRequest.find({})
        let ids = []
        ids.push(req.user._id)
        connection.forEach((request) => {
            if (request.toUserId.equals(req.user._id)) {
                ids.push(request.fromUserId)
            } else if (request.fromUserId.equals(req.user._id)) {
                ids.push(request.toUserId)
            }
        })

        const users = await User.find({ _id: { $nin: ids },emailVerified:true }).skip(skip).limit(limit)
        const usersData = users.map(({ firstName, lastName, profile, age, gender, skills, _id, bio }) => {
            return { _id, firstName, lastName, profile, age, gender, skills, bio }
        })

        res.json({ data: usersData })
    } catch (err) {
        res.status(400).send("users not found--------" + err.message)
    }
})

//userDetails
userRouter.get('/profile', auth, async (req, res) => {
    try {
        res.send(req.user)
    } catch (err) {
        res.status(400).send("Can not find posts" + err.message)
    }
})

//Update a user by id
userRouter.patch("/profile/update", auth, async (req, res) => {
    const { firstName, lastName, password, email, age, gender, profile, bio, skills } = req.body
    try {
        if (firstName || lastName || password || email) {
            throw new Error("Some of the fields can't be changed");

        }
        const user = await User.findByIdAndUpdate(req.user._id, { age, gender, profile, bio, skills }, {
            runValidators: true,
            returnDocument: 'after'
        })
        const userObject = user.toObject()
        delete userObject.email
        delete userObject.password
        res.send(userObject)
    } catch (err) {
        res.status(400).send(err.message)
    }
})

// Update the password
userRouter.post('/profile/changepassword', auth, async (req, res) => {
    const { password, newPassword } = req.body
    try {
        const { _id } = req.user
        const user = await User.findOne(_id)
        const isOldPasswordSame = await bcrypt.compare(password, user.password)
        if (!isOldPasswordSame) {
            throw new Error("Old password is not same ");
        }
        const passwordHash = await bcrypt.hash(newPassword, 10)
        const updatePassword = await User.findByIdAndUpdate(_id, { password: passwordHash })
        res.send(updatePassword)
    } catch (err) {
        res.status(400).send(err.message)
    }
})

// update user profile and cover image
userRouter.patch('/profile/update/cover', upload, auth, async (req, res) => {

    try {
        const { _id } = req.user
        const profileurl = req.files["profilePic"] && `${req.protocol}://${req.get('host')}/uploads/${req.files["profilePic"][0].filename}`;
        const coverurl = req.files["coverPic"] && `${req.protocol}://${req.get('host')}/uploads/${req.files["coverPic"][0].filename}`;

        const user = await User.findByIdAndUpdate(_id, { profile: profileurl, cover: coverurl }, { new: true })
        const { profile, cover } = user
        res.json({ profile, cover })
    }
    catch (err) {
        res.status(400).send(err.message)
    }


})



module.exports = userRouter
