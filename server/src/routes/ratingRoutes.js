import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { submitRating, getFreelancerRatings, getRatingStats } from '../controllers/ratingController.js'

const router = express.Router()

// Submit a rating for a freelancer (protected - client only)
// POST /api/ratings
// Body: { freelancerId, projectId, score: 1-5, feedback: "optional" }
router.post('/', protect, submitRating)

// Get all ratings for a freelancer (public - anyone can view)
// GET /api/ratings/freelancer/:freelancerId
router.get('/freelancer/:freelancerId', getFreelancerRatings)

// Get rating statistics for a freelancer (public - anyone can view)
// GET /api/ratings/stats/:freelancerId
router.get('/stats/:freelancerId', getRatingStats)

export default router
