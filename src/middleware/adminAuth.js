const jwt = require('jsonwebtoken')
const User = require('../models/users')


const auth = async(req, res, next) => {
    try {
        const token = req.headers['token']
        console.log('token-------',token)
        if (!token) {
            throw new Error("Invalid token");
        }
        const getId = await jwt.verify(token, 'Worker')
        const user = await User.findById(getId._id)
        if (!user) {
            throw new Error("User not found");
        }
        req.user= user
        next()
    } catch (err) {
        res.status(400).send(err.message)
    }
}

module.exports = {
    auth
}