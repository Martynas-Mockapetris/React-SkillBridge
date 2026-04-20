import express from 'express'
import { registerUser, loginUser, getUserProfile, requestEmailVerification, confirmEmailVerification } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public routes
router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/verify-email/confirm', confirmEmailVerification)

// Protected routes
router.get('/profile', protect, getUserProfile)
router.post('/verify-email/request', protect, requestEmailVerification)

export default router