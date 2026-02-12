import express from 'express'
import {
  createProject,
  getUserProjects,
  getProjectById,
  getProjectByIdOwner,
  updateProject,
  deleteProject,
  getAllProjects,
  assignUserToProject,
  reassignProject,
  removeAssignee,
  getInterestedProjects,
  removeFromInterested,
  submitProject,
  reviewProject
} from '../controllers/projectController.js'
import { protect, optionalProtect } from '../middleware/authMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'

const router = express.Router()

// Test route
router.get('/test', (req, res) => {
  console.log('Test route hit!')
  res.json({ message: 'Project routes are working' })
})

// Project routes
router.post('/', protect, upload.array('attachments', 5), createProject)
router.get('/', protect, getUserProjects)
router.get('/all', getAllProjects)
router.get('/interested', protect, getInterestedProjects)
router.get('/:id', optionalProtect, getProjectById) // Used by both owners and participants
router.get('/:id/owner', protect, getProjectByIdOwner)
router.put('/:id', protect, upload.array('attachments', 5), updateProject)
router.delete('/:id', protect, deleteProject)

// Assignment routes
router.post('/:id/assign', protect, assignUserToProject)
router.put('/:id/reassign', protect, reassignProject)
router.delete('/:id/assignee', protect, removeAssignee)
router.delete('/:id/interested', protect, removeFromInterested)

// Submission & Review routes
router.post('/:id/submit', protect, upload.array('submissionFiles', 5), submitProject)
router.post('/:id/review', protect, reviewProject)

export default router
