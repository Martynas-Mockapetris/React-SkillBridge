import { verifyToken } from '../utils/jwtUtils.js'
import User from '../models/User.js'
import { PERMISSIONS, hasPermission, hasAnyPermission, hasAllPermissions } from '../utils/permissions.js'

export const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]

      const decoded = verifyToken(token)

      if (!decoded) {
        return res.status(401).json({ message: 'Not authorized, token failed' })
      }

      req.user = await User.findById(decoded.id).select('-password')

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' })
      }

      next()
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' })
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' })
  }
}

export const optionalProtect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = verifyToken(token)
      req.user = await User.findById(decoded.id).select('-password')
    } catch (error) {
      // invalid token -> treat as guest
      req.user = null
    }
  }

  next()
}

const ensureAuthenticated = (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' })
    return false
  }

  return true
}

export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!ensureAuthenticated(req, res)) {
      return
    }

    if (!hasPermission(req.user, permission)) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }

    next()
  }
}

export const requireAnyPermission = (permissions = []) => {
  return (req, res, next) => {
    if (!ensureAuthenticated(req, res)) {
      return
    }

    if (!hasAnyPermission(req.user, permissions)) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }

    next()
  }
}

export const requireAllPermissions = (permissions = []) => {
  return (req, res, next) => {
    if (!ensureAuthenticated(req, res)) {
      return
    }

    if (!hasAllPermissions(req.user, permissions)) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }

    next()
  }
}

export const adminOnly = requireAllPermissions([
  PERMISSIONS.USERS_READ,
  PERMISSIONS.USERS_UPDATE,
  PERMISSIONS.USERS_LOCK,
  PERMISSIONS.USERS_DELETE,
  PERMISSIONS.PROJECTS_READ_ADMIN,
  PERMISSIONS.PROJECTS_UPDATE_ADMIN,
  PERMISSIONS.PROJECTS_LOCK_ADMIN,
  PERMISSIONS.PROJECTS_DELETE_ADMIN,
  PERMISSIONS.ANNOUNCEMENTS_READ_ADMIN,
  PERMISSIONS.ANNOUNCEMENTS_UPDATE_ADMIN,
  PERMISSIONS.ANNOUNCEMENTS_DELETE_ADMIN,
  PERMISSIONS.BLOG_READ_ADMIN,
  PERMISSIONS.BLOG_WRITE,
  PERMISSIONS.CONFIG_READ,
  PERMISSIONS.CONFIG_WRITE
])
