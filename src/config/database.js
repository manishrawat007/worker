const mongoose = require("mongoose")

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://manish:Manish@cluster0.wlb2z.mongodb.net/worker')
    } catch (err) {
        console.log("err----in----connecting----", err.message)
    }
}

module.exports = connectDB