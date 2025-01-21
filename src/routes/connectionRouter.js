const express = require('express')
const connectionRouter = express.Router()
const ConnectionRequest = require('../models/connections')
const { auth } = require('../middleware/adminAuth')

//send Request or ignore Request
connectionRouter.post('/send/connection/:status/:toUserId', auth, async (req, res) => {
    try {
        const fromUserId = req.user._id
        const toUserId = req.params.toUserId
        const status = req.params.status

        if (!['interested', 'ignored'].includes(status)) {
            throw new Error("Status is not valid");
        }

        if (fromUserId.equals(toUserId)) {
            throw new Error("you can't send a request to yourself");
        }

        const existingRequest = await ConnectionRequest.findOne({
            '$or': [
                { fromUserId: fromUserId, toUserId: toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        });

        if (existingRequest) {
            throw new Error("User is already send the request");
        }

        const request = new ConnectionRequest({ fromUserId, toUserId, status })
        const data = await request.save()
        res.send(data)
    } catch (err) {
        res.status(400).send(err.message)
    }
})

// when user accept the pending request
connectionRouter.patch('/user/connection/interested/:status/:fromuserId',auth,async(req,res)=>{
    try{
    const status = req.params.status
    const fromUserId  = req.params.fromuserId
    const toUserId=req.user._id

    const userRequests = await ConnectionRequest.findOne({fromUserId,toUserId})

    if(!userRequests){
        throw new Error("No request found");
    }
    
    if(['accepted','rejected'].includes(userRequests.status)){
        throw new Error("User status is already settled");      
    }

    if(userRequests.status=='ignored'){
        throw new Error("User status is ignored")
    }

    userRequests.status= status

    const request = await userRequests.save()
    res.send("user update successfully"+request)
    }catch(err){
        res.status(400).send('something went wrong' + err.message)
    }


})

// user pending request
connectionRouter.get('/user/connection/pending', auth, async (req, res) => {
    try {
        const fromuserId = req.user._id
        const users= await ConnectionRequest.find({toUserId:fromuserId, status: "interested" }).populate("fromUserId",["firstName","lastName","profile","gender"])
        res.json({ users })
    } catch (err) {
        res.status(400).send(err.message)
    }
})

//user followers
connectionRouter.get('/user/followers', auth, async (req, res) => {
    try {
        const fromuserId = req.user._id
        const users = await ConnectionRequest.find({
            $and: [
                { status: "accepted" },
                {
                    $or: [
                        { fromUserId: fromuserId },
                        { toUserId: fromuserId }
                    ]
                }
            ]
        }).populate('fromUserId',['firstName','lastName','profile','gender','age','skills'])
        .populate('toUserId',['firstName','lastName','profile','gender','age','skills'])

        const userData = users.map((user)=>{
            if(user.fromUserId._id.equals(fromuserId)){
                return user.toUserId
            }
            return user.fromUserId
        })
        res.json({ data: userData })
    } catch (err) {
        res.status(400).send(err.message)
    }

})

module.exports = connectionRouter