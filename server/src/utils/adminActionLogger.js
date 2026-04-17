import mongoose from 'mongoose'
import AdminActionLog from '../models/AdminActionLog.js'

const normalizeObjectId = (value) => {
  if (!value) {
    return null
  }

  if (value instanceof mongoose.Types.ObjectId) {
    return value
  }

  if (typeof value === 'object' && value._id) {
    return normalizeObjectId(value._id)
  }

  return mongoose.Types.ObjectId.isValid(value) ? new mongoose.Types.ObjectId(value) : null
}

const normalizeScalar = (value) => {
  if (value === undefined) return null
  if (value === null) return null
  if (value instanceof Date) return value.toISOString()
  if (value instanceof mongoose.Types.ObjectId) return value.toString()

  if (Array.isArray(value)) {
    return value.map((item) => normalizeScalar(item))
  }

  if (typeof value === 'object') {
    return value
  }

  return value
}

export const buildFieldChanges = (beforeState = {}, afterState = {}, fields = []) => {
  if (!Array.isArray(fields) || fields.length === 0) {
    return []
  }

  return fields.reduce((changes, field) => {
    const beforeValue = normalizeScalar(beforeState[field])
    const afterValue = normalizeScalar(afterState[field])

    if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
      changes.push({
        field,
        before: beforeValue,
        after: afterValue
      })
    }

    return changes
  }, [])
}

export const getAuditRequestContext = (req) => {
  if (!req) {
    return { ipAddress: '', userAgent: '' }
  }

  const forwardedFor = req.headers?.['x-forwarded-for']
  const ipAddress = Array.isArray(forwardedFor) ? forwardedFor[0] : typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : req.ip || req.socket?.remoteAddress || ''

  return {
    ipAddress,
    userAgent: req.headers?.['user-agent'] || ''
  }
}

export const logAdminAction = async ({ req, actor = null, action, targetType, targetId, targetLabel = '', summary, changes = [], metadata = {} }) => {
  try {
    const actorId = normalizeObjectId(actor || req?.user?._id)
    const normalizedTargetId = normalizeObjectId(targetId)

    if (!actorId || !normalizedTargetId || !action || !targetType || !summary) {
      return null
    }

    const actorRole = req?.user?.userType || (typeof actor === 'object' ? actor.userType : '') || 'unknown'

    return await AdminActionLog.create({
      actor: actorId,
      actorRole,
      action,
      targetType,
      targetId: normalizedTargetId,
      targetLabel: targetLabel || '',
      summary,
      changes: Array.isArray(changes) ? changes : [],
      metadata: metadata && typeof metadata === 'object' ? metadata : {},
      context: getAuditRequestContext(req)
    })
  } catch (error) {
    console.error('Failed to write admin action log:', error)
    return null
  }
}
