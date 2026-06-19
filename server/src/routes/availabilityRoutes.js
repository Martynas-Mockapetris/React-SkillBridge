import express from 'express'
import {
  getFreelancerCalendar,
  getFreelancerAvailability,
  updateDayAvailability,
  getFreelancerAllCalendars,
  getPublicFreelancerCalendar,
  toggleCalendarVisibility,
  calculateFreelancerCapacity,
  batchCalculateCapacity
} from '../controllers/availabilityController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public routes (no auth required)
router.get('/public/:freelancerId/:year/:month', getPublicFreelancerCalendar)

// Capacity calculation routes
router.get('/:freelancerId/capacity', protect, calculateFreelancerCapacity)
router.post('/batch/capacity', protect, batchCalculateCapacity)

// Protected routes (auth required)
router.get('/:freelancerId/current', protect, getFreelancerCalendar)
router.get('/:freelancerId/availability', protect, getFreelancerAvailability)
router.get('/:freelancerId/all', protect, getFreelancerAllCalendars)
router.put('/:freelancerId/:year/:month/:date', protect, updateDayAvailability)
router.patch('/:freelancerId/visibility', protect, toggleCalendarVisibility)

export default router
