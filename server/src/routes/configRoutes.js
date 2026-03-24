import express from 'express'
import { protect, adminOnly } from '../middleware/authMiddleware.js'
import { getSystemConfig, updateSystemConfigSection } from '../controllers/configController.js'

const router = express.Router()

router.get('/', protect, adminOnly, getSystemConfig)
router.put('/:section', protect, adminOnly, updateSystemConfigSection)

export default router
