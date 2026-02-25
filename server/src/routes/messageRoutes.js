import express from 'express'
import { sendMessage, getProjectMessages, getUserMessages, getConversation, markAsRead } from '../controllers/messageController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// All message routes require authentication
router.post('/', protect, sendMessage)
router.get('/my-messages', protect, getUserMessages)
router.get('/conversation/:userId', protect, getConversation)
router.get('/project/:projectId', protect, getProjectMessages)
router.put('/:id/read', protect, markAsRead)

export default router
