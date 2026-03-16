import express from 'express'
import { checkAuthenticated, getAlluser, logOut, sendOtp, updateProfile, verificationOtp } from '../Controllers/auth.cont.js';
import authMiddleware from '../Middleware/auth.Middle.js';
import { multerMiddleware } from '../Database/cloudinaryConfig.js';

const router = express.Router()

router.post('/send-otp',sendOtp);
router.post('/verify-otp',verificationOtp);
router.get('/logout',logOut);


// Protected Routes
router.put('/update-profile',authMiddleware,multerMiddleware,updateProfile);
router.get('/check-auth',authMiddleware,checkAuthenticated);
router.get('/user',authMiddleware,getAlluser);


export default router;