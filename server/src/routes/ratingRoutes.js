import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { submitRating, getFreelancerRatings, getRatingStats } from '../controllers/ratingController.js'

const router = express.Router()

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Rating routes are working' })
})

// Submit rating route (protected - requires authentication)
router.post('/', protect, submitRating)

// Rating retrieval routes (public - anyone can view)
router.get('/freelancer/:freelancerId', getFreelancerRatings)
router.get('/stats/:freelancerId', getRatingStats)

export default router
