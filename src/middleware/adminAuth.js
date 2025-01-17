const jwt = require('jsonwebtoken')
const User = require('../models/users')


const auth = (req, res, next) => {
    try {
        const { token } = req.cookies
        if (!token) {
            throw new Error("Invalid token");
        }
        const getId = jwt.verify(token, 'Worker')
        const user = User.findById(getId._id)
        if (!user) {
            throw new Error("User not found");
        }
        next()
    } catch (err) {
        res.status(400).send(err.message)
    }
}

module.exports = {
    auth
}