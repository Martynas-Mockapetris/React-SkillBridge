import express from 'express'
import { protect, requirePermission } from '../middleware/authMiddleware.js'
import { PERMISSIONS } from '../utils/permissions.js'
import { getPublicSystemConfig, getSystemConfig, updateSystemConfigSection } from '../controllers/configController.js'

const router = express.Router()

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Config routes are working' })
})

// Public config route (no authentication required)
router.get('/public', getPublicSystemConfig)

// Admin configuration routes (protected - admin only)
router.get('/', protect, requirePermission(PERMISSIONS.CONFIG_READ), getSystemConfig)
router.put('/:section', protect, requirePermission(PERMISSIONS.CONFIG_WRITE), updateSystemConfigSection)

export default router
