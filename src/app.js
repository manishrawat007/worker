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
// app.use(cors({
//     origin: 'https://worker-lytn.onrender.com',
//     credentials: true,
//     methods: "GET,POST,PATCH,DELETE",
//     allowedHeaders: "Content-Type,Authorization",
// }));

const allowedOrigins = [
    "http://localhost:3000", // ✅ Development Frontend
    "https://worker-lytn.onrender.com" // ✅ Production Frontend (Update this)
  ];
  
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // ✅ Allow cookies/authentication
    methods: "GET, POST, PATCH, DELETE, OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
  }));
  
  // ✅ Handle Preflight Requests
  app.options("*", cors());

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
