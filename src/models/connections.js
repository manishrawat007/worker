const mongoose = require('mongoose')

const connectionSchema = new mongoose.Schema({
    fromUserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users'
    },
    toUserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users'
    },
    status:{
        type:String,
        enum:{
            values:["ignored","interested","accepted","rejected"]
        }
    }
})

const ConnectionRequest = mongoose.model('connections',connectionSchema)

module.exports = ConnectionRequest