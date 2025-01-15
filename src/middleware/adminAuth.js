const auth = (req,res,next)=>{
    const token="123"
    if(token!=='123'){
        res.status(401).send("UnAuthorised token")
    }
    next()
}

module.exports={
    auth 
}