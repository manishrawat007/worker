const mongoose = require("mongoose")

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
        // validate:(value)=>{
        //     const passwordRegex = /^(?=(.*[A-Z]){1,})(?=(.*[a-z]){1,})(?=(.*\d){1,})(?=(.*[@$!%*?&#]){1,})[A-Za-z\d@$!%*?&#]{8,}$/
        //     if(!passwordRegex.test(value)){
        //         throw new Error("Password must have at least one capital letter, one lowercase letter ,one special character,one digit, characters in length"); 
        //     }
        // }
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

const User = mongoose.model('Users', userSchema)

module.exports = User

