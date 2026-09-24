import express from 'express'
import {
  createProject,
  publishProject,
  getUserProjects,
  getProjectById,
  getProjectByIdOwner,
  updateProject,
  deleteProject,
  getAllProjects,
  filterProjectsByBudget,
  filterProjectsByStatus,
  filterProjectsBySkills,
  filterProjectsByPriority,
  filterProjects,
  filterProjectsByKeyword,
  getAdminAllProjects,
  deleteProjectAsAdmin,
  updateProjectAsAdmin,
  bulkRenewProjectDeadlinesAsAdmin,
  toggleProjectLockAsAdmin,
  removeAssigneeAsAdmin,
  toggleApplicantShortlist,
  toggleApplicantSkillsVerified,
  assignUserToProject,
  reassignProject,
  proposeRate,
  counterRate,
  acceptRate,
  removeAssignee,
  getInterestedProjects,
  removeFromInterested,
  submitProject,
  reviewProject,
  markProjectComplete,
  getProjectCompletionStats,
  bulkCompleteProjects,
  rescheduleProject
} from '../controllers/projectController.js'
import { protect, optionalProtect, requirePermission } from '../middleware/authMiddleware.js'
import { PERMISSIONS } from '../utils/permissions.js'
import upload from '../middleware/uploadMiddleware.js'

const router = express.Router()

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Project routes are working' })
})

// Project creation and publishing routes
router.post('/', protect, upload.array('attachments', 5), createProject)
router.put('/:id/publish', protect, publishProject)

// Project retrieval routes (public and user projects)
router.get('/all', getAllProjects)
router.get('/', protect, getUserProjects)

// Project search and filtering routes (specific routes BEFORE /:id)
router.get('/filter/budget', filterProjectsByBudget)
router.get('/filter/status', filterProjectsByStatus)
router.get('/filter/skills', filterProjectsBySkills)
router.get('/filter/priority', filterProjectsByPriority)
router.get('/filter', filterProjects)
router.get('/search', filterProjectsByKeyword)

// Project interest routes (specific routes BEFORE /:id)
router.get('/interested', protect, getInterestedProjects)

// Dynamic routes AFTER specific routes
router.get('/:id', optionalProtect, getProjectById)
router.get('/:id/owner', protect, getProjectByIdOwner)

// Project update and deletion routes
router.put('/:id', protect, upload.array('attachments', 5), updateProject)
router.delete('/:id', protect, deleteProject)
router.delete('/:id/interested', protect, removeFromInterested)

// Applicant management routes
router.patch('/:id/applicants/:userId/shortlist', protect, toggleApplicantShortlist)
router.patch('/:id/applicants/:userId/verify-skills', protect, toggleApplicantSkillsVerified)

// Project assignment routes
router.post('/:id/assign', protect, assignUserToProject)
router.put('/:id/reassign', protect, reassignProject)
router.delete('/:id/assignee', protect, removeAssignee)

// Rate negotiation routes
router.post('/:id/rate/propose', protect, proposeRate)
router.post('/:id/rate/counter', protect, counterRate)
router.post('/:id/rate/accept', protect, acceptRate)

// Project submission and review routes
router.post('/:id/submit', protect, upload.array('submissionFiles', 5), submitProject)
router.post('/:id/review', protect, reviewProject)

// Project completion routes
router.patch('/:projectId/complete', protect, markProjectComplete)
router.post('/bulk-complete', protect, bulkCompleteProjects)
router.get('/stats/completion', protect, getProjectCompletionStats)

// Project rescheduling routes
router.patch('/:id/reschedule', protect, rescheduleProject)

// Admin project management routes
router.get('/admin/all', protect, requirePermission(PERMISSIONS.PROJECTS_READ_ADMIN), getAdminAllProjects)
router.put('/admin/:id', protect, requirePermission(PERMISSIONS.PROJECTS_UPDATE_ADMIN), updateProjectAsAdmin)
router.delete('/admin/:id', protect, requirePermission(PERMISSIONS.PROJECTS_DELETE_ADMIN), deleteProjectAsAdmin)
router.patch('/admin/:id/lock', protect, requirePermission(PERMISSIONS.PROJECTS_LOCK_ADMIN), toggleProjectLockAsAdmin)
router.patch('/admin/deadlines/bulk', protect, requirePermission(PERMISSIONS.PROJECTS_UPDATE_ADMIN), bulkRenewProjectDeadlinesAsAdmin)
router.delete('/admin/:id/assignee', protect, requirePermission(PERMISSIONS.PROJECTS_UPDATE_ADMIN), removeAssigneeAsAdmin)

export default router
