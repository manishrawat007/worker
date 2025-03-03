const express = require('express')
const { auth } = require('../middleware/adminAuth');
const chatRouter = express.Router()
const Chats = require('../models/chat')
const User=require('../models/users')

chatRouter.post('/send/message/:recieverId', auth, async (req, res) => {
    try {
        const { recieverId } = req.params
        const { _id: senderId } = req.user
        const { message, mediaUrl } = req.body
        if (!recieverId && !message) {
            throw new Error("Please send valid payload");
        }
        if (senderId.toString() == recieverId.toString()) {
            throw new Error("You can't send message to yourself");
        }
        const existingUserChat = await Chats.findOne({ $or: [{ senderId, recieverId }, { senderId: recieverId, recieverId: senderId }] })
        if (existingUserChat) {
            let newChat = {
                message: message,
                mediaUrl: "",
                id: senderId
            }
            existingUserChat?.messages?.push(newChat)
            const savedChat = await existingUserChat.save()
            return res.json({ message: "Message is send successfully", data: savedChat })
        } else {
            const messages = [{ message, id: senderId }]
            const newChat = new Chats({ recieverId, senderId, messages, mediaUrl })
            const savedChat = await newChat.save()
            return res.json({ message: "Message is send successfully", data: savedChat })
        }
    } catch (err) {
        res.status(400).send(err.message)
    }
})

chatRouter.get('/user/message/:recieverId', auth, async (req, res) => {
    try {
        const { recieverId } = req.params
        const { _id: senderId } = req.user
        if (senderId.toString() == recieverId.toString()) {
            throw new Error("Similar User found");
        }
        const userChats = await Chats.findOne({ $or: [{ senderId, recieverId }, { senderId: recieverId, recieverId: senderId }] }).populate("senderId", "firstName lastName _id profile").populate("recieverId", "firstName lastName _id profile")
        if (!userChats) {
            const userDetail= await User.findById(recieverId)
            if(!userDetail){
                throw new Error("No user found");      
            }
            const userChats={
                senderId:{
                    _id:userDetail._id,
                    firstName:userDetail.firstName,
                    lastName:userDetail.lastName,
                    profile:userDetail.profile
                },
                recieverId:{
                    _id:req.user._id,
                    firstName:req.user.firstName,
                    lastName:req.user.lastName,
                    profile:req.user.lastName
                },
                messages:[]
            }
            
            return res.json({data:userChats})
        }
        res.json({ data: userChats })
    } catch (err) {
        res.status(400).send(err.message)

    }
})

chatRouter.get('/users/message/list', auth, async (req, res) => {
    try {
        const { _id } = req.user
        const userList = await Chats.find({ $or: [{ senderId: _id }, { recieverId: _id }] }).populate("senderId", "firstName lastName _id profile").populate("recieverId", "firstName lastName _id profile")
        if (!userList) {
            throw new Error("No List found");
        }
        const users = userList.map((user) => {
            if (user.senderId._id.toString() == _id.toString()) {
                return user.recieverId
            } else {
                return user.senderId
            }
        })
        res.json({ userList: users })
    } catch (err) {
        res.status(400).send(err.message)
    }
})


module.exports = chatRouter