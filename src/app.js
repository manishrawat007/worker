const express = require("express")
const {auth}=require('../middleware/adminAuth')

const app = express()

app.use('/admin',auth)

app.get('/admin',(req,res)=>{
    res.send("Admin is Authorised")
})

app.post('/admin',(req,res)=>{
    res.send('Admin Details are saved')
})

app.put('/admin',(req,res)=>{
    res.send("Admin Details are updated")
})

app.delete('/admin',(req,res)=>{
    res.send('admin is deleted')
})

app.listen(7777,()=>{
    console.log("server is running")
})