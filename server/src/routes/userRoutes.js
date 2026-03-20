import express from 'express'
import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getUserStats,
  addToFavorites,
  removeFromFavorites,
  getFavoriteProjects,
  getFreelancers,
  getUserById,
  addFreelancerToFavorites,
  removeFreelancerFromFavorites,
  getAdminDashboardStats,
  getAdminUserDetail,
  getAdminUserProjects,
  getAdminUserAnnouncements,
  getAdminUsers,
  toggleUserLock,
  updateAdminUser,
  deleteAdminUser
} from '../controllers/userController.js'
import { protect, adminOnly } from '../middleware/authMiddleware.js'

const router = express.Router()

// Test route
router.get('/test', (req, res) => {
  console.log('Test route hit!')
  res.json({ message: 'User routes are working' })
})

// Profile routes
router.get('/profile', protect, getUserProfile)
router.put('/profile', protect, updateUserProfile)
router.delete('/profile', protect, deleteUserAccount)

// Stats route
router.get('/stats', protect, getUserStats)

// Admin dashboard stats route
router.get('/admin/stats', protect, adminOnly, getAdminDashboardStats)

// Admin user management routes
router.get('/admin/users/:userId/projects', protect, adminOnly, getAdminUserProjects)
router.get('/admin/users/:userId/announcements', protect, adminOnly, getAdminUserAnnouncements)
router.get('/admin/users/:userId', protect, adminOnly, getAdminUserDetail)
router.get('/admin/users', protect, adminOnly, getAdminUsers)
router.patch('/admin/:userId/lock', protect, adminOnly, toggleUserLock)
router.put('/admin/:userId', protect, adminOnly, updateAdminUser)

// Favorites routes - specific routes first!
router.get('/favorites', protect, getFavoriteProjects)
router.post('/favorites/freelancer/:freelancerId', protect, addFreelancerToFavorites)
router.delete('/favorites/freelancer/:freelancerId', protect, removeFreelancerFromFavorites)
router.post('/favorites/:projectId', protect, addToFavorites)
router.delete('/favorites/:projectId', protect, removeFromFavorites)

// Freelancers route
router.get('/freelancers', getFreelancers)

// Get user by ID
router.get('/:id', getUserById)

export default router
