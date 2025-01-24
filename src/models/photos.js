const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    profile:{
        type:[String],
        required:true
    }
})

const Photos = mongoose.model('photos',profileSchema)

module.exports=Photos