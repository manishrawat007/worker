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
            id:{
                type:mongoose.Schema.Types.ObjectId,
                required:true,
            },
            url:{
                type:String,
                required:true
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

const Photos = mongoose.model('photos',profileSchema)

module.exports=Photos