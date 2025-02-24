const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        unique:true,
        ref:'Users'
    },
    profile:[
        {
            url:{
                type:String,
                required:true
            },
            message:{
                type:String,
                trim:true,
                default: ''
            },
            isArchieve:{
                type:Boolean,
                default:false
            },
            uploadedAt: {
                type: Date,
                default: Date.now,
              }
        }
    ]
})

const Posts = mongoose.model('posts',profileSchema)

module.exports=Posts