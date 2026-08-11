import express from 'express'
import {
  getFreelancerCalendar,
  getFreelancerAvailability,
  updateDayAvailability,
  getFreelancerAllCalendars,
  getPublicFreelancerCalendar,
  toggleCalendarVisibility,
  calculateFreelancerCapacity,
  batchCalculateCapacity,
  validateProjectAssignmentCapacity,
  getFilteredAvailability
} from '../controllers/availabilityController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Availability routes are working' })
})

// Public routes (no authentication required)
router.get('/public/:freelancerId/:year/:month', getPublicFreelancerCalendar)

// Calendar management routes (protected)
router.get('/:freelancerId/current', protect, getFreelancerCalendar)
router.get('/:freelancerId/all', protect, getFreelancerAllCalendars)
router.put('/:freelancerId/:year/:month/:date', protect, updateDayAvailability)
router.patch('/:freelancerId/visibility', protect, toggleCalendarVisibility)

// Availability retrieval routes
router.get('/:freelancerId/availability', protect, getFreelancerAvailability)
router.get('/:freelancerId/filtered', protect, getFilteredAvailability)

// Capacity calculation routes
router.get('/:freelancerId/capacity', protect, calculateFreelancerCapacity)
router.post('/batch/capacity', protect, batchCalculateCapacity)
router.post('/:freelancerId/validate-assignment', validateProjectAssignmentCapacity)

export default router
