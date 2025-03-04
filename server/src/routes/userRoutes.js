import express from 'express'
import User from '../models/User.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/test', (req, res) => {
  console.log('Test route hit!')
  res.json({ message: 'User routes are working' })
})

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  console.log('PUT /profile route reached')
  console.log('Request body:', req.body)
  console.log('User from token:', req.user)

  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Update only the fields that are provided in the request
    const fieldsToUpdate = [
      'firstName',
      'lastName',
      'phone',
      'location',
      'skills',
      'bio',
      'website',
      'github',
      'linkedin',
      'twitter',
      'hourlyRate',
      'experienceLevel',
      'languages',
      'certifications',
      'serviceCategories',
      'upworkProfile',
      'fiverrProfile',
      'profilePicture'
    ]

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field]
      }
    })

    // Try saving with specific error handling
    try {
      const updatedUser = await user.save()

      // Convert to plain object and remove password
      const userResponse = updatedUser.toObject()
      delete userResponse.password

      res.json(userResponse)
    } catch (validationError) {
      console.error('Validation error:', validationError)
      return res.status(400).json({
        message: 'Validation error',
        errors: validationError.errors
      })
    }
  } catch (error) {
    console.error('Error updating user profile:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
router.delete('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await user.deleteOne()

    res.json({ message: 'User account deleted successfully' })
  } catch (error) {
    console.error('Error deleting user account:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
