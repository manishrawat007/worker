const express = require("express")
const connectDB = require('./config/database')
const cookieParser = require('cookie-parser')
const authRouter = require('./routes/authRouter')
const userRouter = require('./routes/userRouter')
const connectionRouter = require("./routes/connectionRouter")
const cors = require('cors');

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors());

app.use(cors({
  origin: 'http://localhost:3000/',
  methods: ['GET', 'POST','PUT','PATCH','DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, 
}));

app.use('/',authRouter)
app.use('/',userRouter)
app.use('/',connectionRouter)

connectDB().then(() => {
    app.listen(7777, () => {
        console.log("server is running")
    })
}).catch((err) => {
    console.log("error-------", err.message)
})
