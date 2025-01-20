const express = require('express')
const userRouter = express.Router()
const User = require('../models/users')
const {auth} = require('../middleware/adminAuth')
const bcrypt = require('bcrypt')

// get all user api
userRouter.get('/users', auth, async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch (err) {
        res.status(400).send("users not found--------" + err.message)
    }
})

// get user details
userRouter.get('/profile',auth,async(req,res)=>{
    const {_id} = req.user
    try{
    const user = await User.findById(_id)
    res.send(user)
    }
    catch(err){
        res.status(404).send('User not found' + err.message)
    }

})

//Update a user by id
userRouter.patch("/profile/update",auth, async (req, res) => {
    const {firstName,lastName,password, email, age,gender,profile,bio,skills}=req.body
    try {
        if(firstName|| lastName || password ||email){
            throw new Error("Some of the fields can't be changed");
            
        }
        const user = await User.findByIdAndUpdate(req.user._id,{age,gender,profile,bio,skills} , {
            runValidators: true,
            returnDocument: 'after'
        })
        res.send(user)
    } catch (err) {
        res.status(400).send(err.message)
    }
})

// Update the password
userRouter.post('/profile/changepassword',auth,async(req,res)=>{
    const {password,newPassword} = req.body
    try{
    const {_id} = req.user
    const user= await User.findOne(_id)
    const isOldPasswordSame = await bcrypt.compare(password,user.password)
    if(!isOldPasswordSame){
      throw new Error("Old password is not same ");
    }
    const passwordHash= await bcrypt.hash(newPassword,10)
    const updatePassword = await User.findByIdAndUpdate(_id,{password:passwordHash})
    res.send(updatePassword)
}catch(err){
    res.status(400).send(err.message)
}
})

module.exports= userRouter
