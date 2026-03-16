import express from 'express'
import authMiddleware from '../Middleware/auth.Middle.js';
import { deleteMessage, getConversation, getMessages, markAsRead, sendMessage } from '../Controllers/chat.cont.js';
import { multerMiddleware } from '../Database/cloudinaryConfig.js';

const router = express.Router();

router.post('/send-message',authMiddleware,multerMiddleware,sendMessage);
router.get('/conversation',authMiddleware,getConversation);
router.get('/conversation/:conversationId/messages',authMiddleware,getMessages);

router.put('/messages/read',authMiddleware,markAsRead);
router.delete('/messages/:messageId',authMiddleware,deleteMessage);


export default router;