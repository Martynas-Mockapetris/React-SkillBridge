import express from 'express'
import { registerUser, loginUser, getUserProfile, requestEmailVerification, confirmEmailVerification, forgotPassword, resetPassword } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working' })
})

// Authentication routes (registration & login)
router.post('/register', registerUser)
router.post('/login', loginUser)

// Email verification routes
router.post('/verify-email/request', protect, requestEmailVerification)
router.post('/verify-email/confirm', confirmEmailVerification)

// Password recovery routes
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

// Profile routes
router.get('/profile', protect, getUserProfile)

export default router
