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
  bulkCompleteProjects,
  rescheduleProject
} from '../controllers/projectController.js'
import { protect, optionalProtect, requirePermission } from '../middleware/authMiddleware.js'
import { PERMISSIONS } from '../utils/permissions.js'
import upload from '../middleware/uploadMiddleware.js'
import { getFreelancerAnalytics, recordProfileView } from '../controllers/analyticsController.js'

const router = express.Router()

// Test route
router.get('/test', (req, res) => {
  console.log('Test route hit!')
  res.json({ message: 'Project routes are working' })
})

// Project routes
router.post('/', protect, upload.array('attachments', 5), createProject)
router.put('/:id/publish', protect, publishProject)
router.get('/', protect, getUserProjects)
router.get('/all', getAllProjects)
router.get('/filter/budget', filterProjectsByBudget)
router.get('/filter/status', filterProjectsByStatus)
router.get('/filter/skills', filterProjectsBySkills)
router.get('/filter/priority', filterProjectsByPriority)
router.get('/filter', filterProjects)
router.get('/search', filterProjectsByKeyword)
router.get('/interested', protect, getInterestedProjects)

router.get('/admin/all', protect, requirePermission(PERMISSIONS.PROJECTS_READ_ADMIN), getAdminAllProjects)
router.delete('/admin/:id', protect, requirePermission(PERMISSIONS.PROJECTS_DELETE_ADMIN), deleteProjectAsAdmin)
router.put('/admin/:id', protect, requirePermission(PERMISSIONS.PROJECTS_UPDATE_ADMIN), updateProjectAsAdmin)
router.patch('/admin/deadlines/bulk', protect, requirePermission(PERMISSIONS.PROJECTS_UPDATE_ADMIN), bulkRenewProjectDeadlinesAsAdmin)
router.patch('/admin/:id/lock', protect, requirePermission(PERMISSIONS.PROJECTS_LOCK_ADMIN), toggleProjectLockAsAdmin)
router.delete('/admin/:id/assignee', protect, requirePermission(PERMISSIONS.PROJECTS_UPDATE_ADMIN), removeAssigneeAsAdmin)

router.get('/:id', optionalProtect, getProjectById) // Used by both owners and participants
router.get('/:id/owner', protect, getProjectByIdOwner)
router.put('/:id', protect, upload.array('attachments', 5), updateProject)
router.delete('/:id', protect, deleteProject)

// Assignment routes
router.patch('/:id/applicants/:userId/shortlist', protect, toggleApplicantShortlist)
router.patch('/:id/applicants/:userId/verify-skills', protect, toggleApplicantSkillsVerified)
router.post('/:id/assign', protect, assignUserToProject)
router.put('/:id/reassign', protect, reassignProject)
router.delete('/:id/assignee', protect, removeAssignee)
router.delete('/:id/interested', protect, removeFromInterested)

// Rate negotiation routes
router.post('/:id/rate/propose', protect, proposeRate)
router.post('/:id/rate/counter', protect, counterRate)
router.post('/:id/rate/accept', protect, acceptRate)

// Submission & Review routes
router.post('/:id/submit', protect, upload.array('submissionFiles', 5), submitProject)
router.post('/:id/review', protect, reviewProject)

// Analytics routes
router.get('/freelancer', protect, getFreelancerAnalytics)
router.post('/profile-view/:userId', protect, recordProfileView)

// Project completion endpoints
router.patch('/:projectId/complete', protect, markProjectComplete)
router.post('/bulk-complete', protect, bulkCompleteProjects)
router.get('/stats/completion', protect, getProjectCompletionStats)
router.patch('/:id/reschedule', protect, rescheduleProject)

export default router
