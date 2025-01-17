const express = require("express")
const connectDB = require('./config/database')
const User = require('./models/users')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const { auth } = require('./middleware/adminAuth')

const app = express()
app.use(express.json())
app.use(cookieParser())

//login api
app.post('/login', async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email: email })
        if (!user) {
            throw new Error("User is not found");
        }
        const ispassword = await bcrypt.compare(password, user.password)
        if (!ispassword) {
            throw new Error("Invalid Credentials");
        }
        const token = user.getToken()
        res.cookie("token", token)
        res.send("Login Successfully")
    } catch (err) {
        res.status(400).send(err.message)
    }
})

//create user api
app.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, password, age, gender, profile, bio, skills } = req.body
        const passwordHash = await bcrypt.hash(password, 10)
        const user = new User({ firstName, lastName, email, password: passwordHash, age, gender, profile, bio, skills })
        const newUser = await user.save()
        res.send(newUser)
    } catch (err) {
        res.status(400).send('Some Problem in saving the User' + err.message)
    }
})

// get all user api
app.get('/users', auth, async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch (err) {
        res.status(400).send("users not found--------" + err.message)
    }
})

// get User by email
app.post('/userbyemail',auth, async (req, res) => {
    const email = req.body.email
    try {
        const user = await User.find({ email: email })
        if (user.length == 0) {
            res.send("No user found")
        }
        res.send(user)
    } catch (err) {
        res.status(400).send("something went wrong--------" + err.message)
    }
})

//Update a user by id
app.patch("/update/:id",auth, async (req, res) => {
    const id = req.params.id
    const data = req.body
    try {
        const user = await User.findByIdAndUpdate(id, data, {
            runValidators: true,
            returnDocument: 'after'
        })
        res.send(user)
    } catch (err) {
        res.status(400).send("something went wrong--------" + err.message)
    }
})

//Delete a user accout
app.delete('/user/:id',auth, async (req, res) => {
    const id = req.params.id
    try {
        await User.findByIdAndDelete(id)
        res.send("User Details Deleted Successfully")
    } catch (err) {
        res.status(500).send("something went wrong--------" + err.message)
    }
})

connectDB().then(() => {
    app.listen(7777, () => {
        console.log("server is running")
    })
}).catch((err) => {
    console.log("error-------", err.message)
})
