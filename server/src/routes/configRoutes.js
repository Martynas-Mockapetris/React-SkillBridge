import express from 'express'
import { protect, requirePermission } from '../middleware/authMiddleware.js'
import { PERMISSIONS } from '../utils/permissions.js'
import { getPublicSystemConfig, getSystemConfig, updateSystemConfigSection } from '../controllers/configController.js'

const router = express.Router()

router.get('/public', getPublicSystemConfig)
router.get('/', protect, requirePermission(PERMISSIONS.CONFIG_READ), getSystemConfig)
router.put('/:section', protect, requirePermission(PERMISSIONS.CONFIG_WRITE), updateSystemConfigSection)

export default router