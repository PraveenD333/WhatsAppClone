import dotenv from 'dotenv'
dotenv.config({quiet:true});
import cors from 'cors';
import express from 'express';
import cookieparser from 'cookie-parser';
import bodyParser from 'body-parser';
import AuthRoute from './Routes/auth.route.js'
import ChatRoute from './Routes/chat.route.js'
import StatusRoute from './Routes/status.route.js'


const app = express();

// // Add trust proxy for Render
// app.set("trust proxy", 1);

app.use (cors({
    origin:process.env.FRONTEND_URL,
    credentials:true,
}));

//Middleware
app.use(express.json()); //parse body data
app.use(bodyParser.urlencoded({extended:true})); // parse form data
app.use(cookieparser()); //parse token on every requsest


//Routes
app.use('/api/auth',AuthRoute)
app.use('/api/chats',ChatRoute)
app.use('/api/status',StatusRoute)


export default app;
