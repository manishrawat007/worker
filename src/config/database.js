const mongoose= require("mongoose")

const connectDB= async()=>{
    try{
        await mongoose.connect('mongodb://127.0.0.1:27017/worker')
        console.log("database is connected------")
    }catch(err){
console.log("err----in----connecting----",err.message)
    }
}

module.exports = connectDB