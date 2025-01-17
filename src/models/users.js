const mongoose = require("mongoose")
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    lastName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique:true,
        validate: (value) => {
            const email = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            if (!email.test(value)) {
                throw new Error("Please Enter a valid Email");
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength:8,
    },
    age: {
        type: Number,
        min: 18,
        max: 60
    },
    gender: {
        type: String,
        lowercase: true,
        validate: (value) => {
            if (!["male", "female", "other"].includes(value)) {
                throw new Error("Gender type is not valid");
            }
        }
    },
    profile: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"
    },
    bio: {
        type: String,
        default: "Add a bio data"
    },
    skills: {
        type: [String],
        default: ["Tractor Chalana", "Khet mai paani dena", "Bhaise Charana"]
    }
})

userSchema.methods.getToken=async function(){
    const token = await jwt.sign({ _id: this._id }, 'Worker')
    return token
}

const User = mongoose.model('Users', userSchema)

module.exports = User

