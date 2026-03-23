import express from 'express'
import { protect, adminOnly } from '../middleware/authMiddleware.js'
import {
  createAnnouncement,
  getAnnouncementsByUser,
  getAllAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementStatus,
  toggleAnnouncementStatusAsAdmin,
  deleteAnnouncementAsAdmin
} from '../controllers/announcementController.js'

const router = express.Router()

// Public route - get all active announcements (no auth required)
// Called when browsing freelancers in Listings
// GET /api/announcements
router.get('/', getAllAnnouncements)

// Protected routes - require authentication
// All routes below use verifyToken middleware

// Get current user's announcements
// GET /api/announcements/my-announcements
router.get('/my-announcements', protect, getAnnouncementsByUser)

// Create new announcement
// POST /api/announcements
// Body: { hourlyRate, skills: [], background, title }
router.post('/', protect, createAnnouncement)

// Update announcement by ID
// PUT /api/announcements/:id
// Body: { hourlyRate?, skills?, background?, title? }
router.put('/:id', protect, updateAnnouncement)

// Delete announcement by ID
// DELETE /api/announcements/:id
router.delete('/:id', protect, deleteAnnouncement)

// Toggle announcement status (pause/unpause)
// PATCH /api/announcements/:id/toggle
router.patch('/:id/toggle', protect, toggleAnnouncementStatus)

// Admin moderation routes
router.patch('/admin/:id/toggle', protect, adminOnly, toggleAnnouncementStatusAsAdmin)
router.delete('/admin/:id', protect, adminOnly, deleteAnnouncementAsAdmin)

export default router
