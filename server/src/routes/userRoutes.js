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
import { protect, requireAllPermissions, requirePermission } from '../middleware/authMiddleware.js'
import { PERMISSIONS } from '../utils/permissions.js'

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
router.get(
  '/admin/stats',
  protect,
  requireAllPermissions([
    PERMISSIONS.USERS_READ,
    PERMISSIONS.PROJECTS_READ_ADMIN,
    PERMISSIONS.ANNOUNCEMENTS_READ_ADMIN
  ]),
  getAdminDashboardStats
)

// Admin user management routes
router.get('/admin/users/:userId/projects', protect, requirePermission(PERMISSIONS.PROJECTS_READ_ADMIN), getAdminUserProjects)
router.get('/admin/users/:userId/announcements', protect, requirePermission(PERMISSIONS.ANNOUNCEMENTS_READ_ADMIN), getAdminUserAnnouncements)
router.get('/admin/users/:userId', protect, requirePermission(PERMISSIONS.USERS_READ), getAdminUserDetail)
router.get('/admin/users', protect, requirePermission(PERMISSIONS.USERS_READ), getAdminUsers)
router.patch('/admin/:userId/lock', protect, requirePermission(PERMISSIONS.USERS_LOCK), toggleUserLock)
router.put('/admin/:userId', protect, requirePermission(PERMISSIONS.USERS_UPDATE), updateAdminUser)

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