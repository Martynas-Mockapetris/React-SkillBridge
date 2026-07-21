import mongoose from 'mongoose'
import Project from '../models/Project.js'
import Logger from './logger.js'

const logger = new Logger('ProjectLockScheduler')

const DEFAULT_SCAN_MS = 5 * 60 * 1000 // 5 minutes

let unlockTimer = null
let isRunning = false

const parseScanInterval = () => {
  const raw = Number(process.env.PROJECT_UNLOCK_SCAN_MS)
  if (!Number.isFinite(raw) || raw < 30_000) return DEFAULT_SCAN_MS
  return raw
}

const runProjectUnlockScan = async () => {
  if (isRunning) return
  isRunning = true

  try {
    if (mongoose.connection.readyState !== 1) return

    const now = new Date()
    const lockedProjects = await Project.find({
      isLocked: true,
      lockExpiresAt: { $ne: null, $lt: now }
    }).select('_id status isLocked lockExpiresAt')

    if (lockedProjects.length === 0) return

    await Promise.all(lockedProjects.map((project) => project.ensureUnlockedIfExpired()))
    logger.debug(`[project-lock-scheduler] Auto-unlocked ${lockedProjects.length} expired project lock(s)`)
  } catch (error) {
    logger.error('[project-lock-scheduler] Scan failed:', error)
  } finally {
    isRunning = false
  }
}

export const startProjectAutoUnlockScheduler = () => {
  if (unlockTimer) return

  const scanMs = parseScanInterval()
  unlockTimer = setInterval(runProjectUnlockScan, scanMs)

  // Run one immediate scan on startup.
  runProjectUnlockScan()

  logger.debug(`[project-lock-scheduler] Started (interval: ${scanMs} ms)`)
}
