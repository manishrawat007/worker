const express = require('express')
const User = require('../models/users')
const bcrypt=require('bcrypt')
const {auth} = require('../middleware/adminAuth')

const authRouter = express.Router()

//login api
authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email: email })
        if (!user) {
            throw new Error("Invalid Credentials");
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
authRouter.post('/signup', async (req, res) => {
    try {
        console.log("user------",req.body)
        const { firstName, lastName, email, password, age, gender, profile, bio, skills } = req.body
        const passwordHash = await bcrypt.hash(password, 10)
        const user = new User({ firstName, lastName, email, password: passwordHash, age, gender, profile, bio, skills })
        const newUser = await user.save()
        res.status(201).json(newUser)
    } catch (err) {
        res.status(400).send(err.message)
    }
})

//Delete a user accout
authRouter.delete('/user/:id',auth, async (req, res) => {
    const id = req.params.id
    try {
        await User.findByIdAndDelete(id)
        res.send("User Details Deleted Successfully")
    } catch (err) {
        res.status(500).send("something went wrong--------" + err.message)
    }
})

// logout api 
authRouter.post('/logout',async(req,res)=>{
    try{
    res.cookie("token",'',{expireIn:'0d'})
    res.send("Logout Successfull")
    }catch{
        res.send("Error in Logout")
    }
})

module.exports= authRouter