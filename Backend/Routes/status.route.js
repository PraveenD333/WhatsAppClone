import express from 'express'
import authMiddleware from '../Middleware/auth.Middle.js';
import { multerMiddleware } from '../Database/cloudinaryConfig.js';
import { createStatus, getStatuses, viewStatus, deleteStatus } from '../Controllers/status.cont.js';

const router = express.Router()

// Protected Routes
router.post('/', authMiddleware, multerMiddleware, createStatus);
router.get('/get', authMiddleware, getStatuses);

router.put('/:statusId/view', authMiddleware, viewStatus);
router.delete('/:statusId', authMiddleware, deleteStatus);


export default router;