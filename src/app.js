const express = require("express")
const connectDB = require('./config/database')
const cookieParser = require('cookie-parser')
const authRouter = require('./routes/authRouter')
const userRouter = require('./routes/userRouter')
const connectionRouter = require("./routes/connectionRouter")
const cors = require('cors');
const postRouter = require("./routes/postRouter")

const app = express()
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

app.use(express.json())
app.use(cookieParser())

app.use('/',authRouter)
app.use('/',userRouter)
app.use('/',connectionRouter)
app.use('/',postRouter)
app.use('/uploads',express.static("uploads"))

connectDB().then(() => {
    app.listen(7777, () => {
        console.log("server is running")
    })
}).catch((err) => {
    console.log("error-------", err.message)
})
