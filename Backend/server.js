import http from 'http';
import connectDB from './Database/connectdb.js';
import app from './app.js';
import initializeSocket from './Services/socket.serv.js';

const PORT = process.env.PORT || 3693

const server = http.createServer(app);

const io = initializeSocket(server);

app.use((req,res,next)=>{
    req.io = io;
    req.socketUserMap = io.socketUserMap
    next();
})

server.listen(PORT,() =>{
    console.log(`Server is Running on ${PORT}...`);
    connectDB()
});