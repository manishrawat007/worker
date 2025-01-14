const express = require("express")

const app = express()

app.get("/", (req, res) => {
    res.send("We are on index page")
})

app.post('/', (req, res) => {
    res.send("Data saved Succesfully")
})

app.listen(7777,()=>{
    console.log("server is running")
})