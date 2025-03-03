const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        required:'true',
        ref:"Users"
    },
    recieverId:{
        type:mongoose.Schema.Types.ObjectId,
        required:'true',
        ref:"Users"
    },
    messages:[{
        message:{
            type:String,
            required:true,
            trim:true
        },
        mediaUrl: {
            type: String,
            default:''
        },
        time:{
            type:Date,
            default:Date.now
        },
        id:{
            type:mongoose.Schema.Types.ObjectId,
            required:'true' 
        }
    }]
})

const Chats = mongoose.model("Chats",chatSchema)

module.exports=Chats