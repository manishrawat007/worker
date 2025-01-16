const express = require("express")
const connectDB = require('./config/database')
const User = require('./models/users')

const app = express()
app.use(express.json())

//create user api
app.post('/signup', async (req, res) => {
    try {
        const user = new User(req.body)
        const newUser = await user.save()
        res.send(newUser)
    } catch (err) {
        res.status(400).send('Some Problem in saving the User')
    }
})

// get all user api
app.get('/users',async(req,res)=>{
   try{
   const users= await User.find({})
   res.send(users)
   }catch(err){
    res.status(400).send("users not found--------",err.message)
   }
})

// get User by email
app.post('/userbyemail',async(req,res)=>{
    const email= req.body.email
    try{
    const user= await User.find({email:email})
    if(user.length==0){
        res.send("No user found")
    }
    res.send(user)
    }catch(err){
        res.status(400).send("something went wrong--------",err.message)
    }
})

//Update a user by id
app.patch("/update/:id",async(req,res)=>{
    const id= req.params.id
    const data = req.body
    try{
        const user = await User.findByIdAndUpdate(id,data)
        res.send(user)
    }catch(err){
        res.status(400).send("something went wrong--------",err.message)
    }
})

//Delete a user accout
app.delete('/user/:id',async(req,res)=>{
    const id=req.params.id
    try{
        await User.findByIdAndDelete(id)
        res.send("User Details Deleted Successfully")
    }catch(err){
        res.status(500).send("something went wrong--------",err.message)
    }
})

connectDB().then(() => {
    app.listen(7777, () => {
        console.log("server is running")
    })
}).catch((err) => {
    console.log("error-------", err.message)
})
