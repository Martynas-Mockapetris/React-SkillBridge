import express from 'express'
import { registerUser, loginUser, getUserProfile, requestEmailVerification, confirmEmailVerification, forgotPassword, resetPassword } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public routes
router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/verify-email/confirm', confirmEmailVerification)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

// Protected routes
router.get('/profile', protect, getUserProfile)
router.post('/verify-email/request', protect, requestEmailVerification)

export default router