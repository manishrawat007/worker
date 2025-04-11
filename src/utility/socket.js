const socket= require('socket.io')

const initialiseSocket=(server)=>{

    const io = socket(server,{
        cors:{
            origin:'*'
        }
    })

    io.on('connection',(socket)=>{

        socket.on('joinChat',()=>{

        })

        socket.on('sendMessage',()=>{
            
        })

        socket.on('disconnect',()=>{
            
        })
    })
}

module.exports=initialiseSocket