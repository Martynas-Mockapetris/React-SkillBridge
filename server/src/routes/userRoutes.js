import express from 'express'
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  deleteUserAccount,
  getUserStats,
  addToFavorites,
  removeFromFavorites,
  getFavoriteProjects,
  getFreelancers,
  getUserById,
  getMyConnections,
  sendConnectionRequest,
  acceptConnectionRequest,
  declineConnectionRequest,
  removeConnection,
  addFreelancerToFavorites,
  removeFreelancerFromFavorites,
  getAdminDashboardStats,
  getAdminAuditLogs,
  getAdminUserDetail,
  getAdminUserProjects,
  getAdminUserAnnouncements,
  getAdminUsers,
  toggleUserLock,
  updateAdminUser,
  requestAdminPasswordReset,
  requestAdminEmailVerification,
  reactivateAdminUser,
  verifyAdminUserDirect,
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
router.put('/profile/password', protect, changeUserPassword)
router.delete('/profile', protect, deleteUserAccount)

// Stats route
router.get('/stats', protect, getUserStats)

// Admin dashboard stats route
router.get('/admin/stats', protect, requireAllPermissions([PERMISSIONS.USERS_READ, PERMISSIONS.PROJECTS_READ_ADMIN, PERMISSIONS.ANNOUNCEMENTS_READ_ADMIN]), getAdminDashboardStats)

// Admin audit logs route
router.get('/admin/audit-logs', protect, requireAllPermissions([PERMISSIONS.USERS_READ, PERMISSIONS.PROJECTS_READ_ADMIN, PERMISSIONS.ANNOUNCEMENTS_READ_ADMIN]), getAdminAuditLogs)

// Admin user management routes
router.get('/admin/users/:userId/projects', protect, requirePermission(PERMISSIONS.PROJECTS_READ_ADMIN), getAdminUserProjects)
router.get('/admin/users/:userId/announcements', protect, requirePermission(PERMISSIONS.ANNOUNCEMENTS_READ_ADMIN), getAdminUserAnnouncements)
router.get('/admin/users/:userId', protect, requirePermission(PERMISSIONS.USERS_READ), getAdminUserDetail)
router.get('/admin/users', protect, requirePermission(PERMISSIONS.USERS_READ), getAdminUsers)
router.patch('/admin/:userId/lock', protect, requirePermission(PERMISSIONS.USERS_LOCK), toggleUserLock)
router.put('/admin/:userId', protect, requirePermission(PERMISSIONS.USERS_UPDATE), updateAdminUser)
router.post('/admin/:userId/password-reset', protect, requirePermission(PERMISSIONS.USERS_UPDATE), requestAdminPasswordReset)
router.post('/admin/:userId/verify-email', protect, requirePermission(PERMISSIONS.USERS_UPDATE), requestAdminEmailVerification)
router.patch('/admin/:userId/reactivate', protect, requirePermission(PERMISSIONS.USERS_UPDATE), reactivateAdminUser)
router.patch('/admin/:userId/verify-email/direct', protect, requirePermission(PERMISSIONS.USERS_UPDATE), verifyAdminUserDirect)
router.delete('/admin/:userId', protect, requirePermission(PERMISSIONS.USERS_DELETE), deleteAdminUser)

// Connections routes
router.get('/connections', protect, getMyConnections)
router.post('/connections/:userId', protect, sendConnectionRequest)
router.patch('/connections/:connectionId/accept', protect, acceptConnectionRequest)
router.patch('/connections/:connectionId/decline', protect, declineConnectionRequest)
router.delete('/connections/:connectionId', protect, removeConnection)

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
