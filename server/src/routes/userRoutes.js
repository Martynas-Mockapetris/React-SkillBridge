import express from 'express'
import { getUserProfile, updateUserProfile, deleteUserAccount, getUserStats } from '../controllers/userController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Test route
router.get('/test', (req, res) => {
  console.log('Test route hit!')
  res.json({ message: 'User routes are working' })
})

// Profile routes
router.get('/profile', protect, getUserProfile)
router.put('/profile', protect, updateUserProfile)
router.delete('/profile', protect, deleteUserAccount)

// Stats route
router.get('/stats', protect, getUserStats)

export default router
