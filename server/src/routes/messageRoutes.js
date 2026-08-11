import express from 'express'
import { sendMessage, getProjectMessages, getUserMessages, getConversation, markAsRead } from '../controllers/messageController.js'
import { protect } from '../middleware/authMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'

const router = express.Router()

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Message routes are working' })
})

// Message sending route
router.post('/', protect, upload.array('attachments', 5), sendMessage)

// Message retrieval routes
router.get('/my-messages', protect, getUserMessages)
router.get('/project/:projectId', protect, getProjectMessages)
router.get('/conversation/:userId', protect, getConversation)

// Message status routes
router.put('/:id/read', protect, markAsRead)

export default router
