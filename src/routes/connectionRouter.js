const express = require('express')
const connectionRouter = express.Router()
const ConnectionRequest = require('../models/connections')
const { auth } = require('../middleware/adminAuth')

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

module.exports = connectionRouter