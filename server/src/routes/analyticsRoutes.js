import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { getFreelancerAnalytics, recordProfileView } from '../controllers/analyticsController.js'

const router = express.Router()

router.get('/freelancer', protect, getFreelancerAnalytics)
router.post('/profile-view/:userId', protect, recordProfileView)

export default router
