import express from 'express'
import { protect, requirePermission } from '../middleware/authMiddleware.js'
import { PERMISSIONS } from '../utils/permissions.js'
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

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Announcement routes are working' })
})

// Public route (browse all active announcements)
router.get('/', getAllAnnouncements)

// User announcement management routes (protected)
router.get('/my-announcements', protect, getAnnouncementsByUser)
router.post('/', protect, createAnnouncement)
router.put('/:id', protect, updateAnnouncement)
router.delete('/:id', protect, deleteAnnouncement)
router.patch('/:id/toggle', protect, toggleAnnouncementStatus)

// Admin moderation routes (protected - admin only)
router.patch('/admin/:id/toggle', protect, requirePermission(PERMISSIONS.ANNOUNCEMENTS_UPDATE_ADMIN), toggleAnnouncementStatusAsAdmin)
router.delete('/admin/:id', protect, requirePermission(PERMISSIONS.ANNOUNCEMENTS_DELETE_ADMIN), deleteAnnouncementAsAdmin)

export default router
