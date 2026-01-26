import express from 'express'
import { createProject, getUserProjects, getProjectById, updateProject, deleteProject, getAllProjects } from '../controllers/projectController.js'
import { protect } from '../middleware/authMiddleware.js'
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
router.get('/:id', getProjectById) // Public - no protect middleware
router.put('/:id', protect, upload.array('attachments', 5), updateProject)
router.delete('/:id', protect, deleteProject)

export default router
