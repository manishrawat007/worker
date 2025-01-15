const express = require("express")
const connectDB = require('./config/database')
const User = require('./models/users')

const app = express()
app.use(express.json())

app.post('/signup', async (req, res) => {
    try {
        const user = new User(req.body)
        const newUser = await user.save()
        res.send(newUser)
    } catch (err) {
        res.status(400).send('Some Problem in saving the User')
    }
})

connectDB().then(() => {
    app.listen(7777, () => {
        console.log("server is running")
    })
}).catch((err) => {
    console.log("error-------", err.message)
})
