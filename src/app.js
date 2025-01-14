const express = require("express")

const app = express()

app.use("/test", (req, res) => {
    res.send("We are on test page")
})

app.use('/', (req, res) => {
    res.send("Home Page")
})

app.listen(7777,()=>{
    console.log("server is running")
})