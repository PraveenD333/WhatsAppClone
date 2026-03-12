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

app.use (cors({
    origin:process.env.FRONTEND_URL,
    credentials:true,
}));

//Middleware
app.use(express.json()); //parse body data
app.use(cookieparser()); //parse token on every requsest
app.use(bodyParser.urlencoded({extended:true})); // parse form data


//Routes
app.use('/api/auth',AuthRoute)
app.use('/api/chats',ChatRoute)
app.use('/api/status',StatusRoute)


export default app;
