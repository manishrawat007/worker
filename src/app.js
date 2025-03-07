const express = require("express")
const connectDB = require('./config/database')
const cookieParser = require('cookie-parser')
const authRouter = require('./routes/authRouter')
const userRouter = require('./routes/userRouter')
const connectionRouter = require("./routes/connectionRouter")
const cors = require('cors');
const postRouter = require("./routes/postRouter")
const dotenv = require('dotenv')
const chatRouter = require("./routes/chatRouter")
dotenv.config("")

const app = express()

const allowedOrigins = [
  "http://localhost:3000",
  "https://worker-olive.vercel.app"
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(cors());

app.use(express.json())
app.use(cookieParser())

app.use('/',authRouter)
app.use('/',userRouter)
app.use('/',connectionRouter)
app.use('/',postRouter)
app.use('/',chatRouter)
app.use('/uploads',express.static("uploads"))

connectDB().then(() => {
    app.listen(7777, () => {
        console.log("server is running")
    })
}).catch((err) => {
    console.log("error-------", err.message)
})
