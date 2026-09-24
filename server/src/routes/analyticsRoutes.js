import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { getFreelancerAnalytics, recordProfileView } from '../controllers/analyticsController.js'

const router = express.Router()

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Analytics routes are working' })
})

// Freelancer analytics route
router.get('/freelancer', protect, getFreelancerAnalytics)

// Profile view tracking route
router.post('/profile-view/:userId', protect, recordProfileView)

export default router
