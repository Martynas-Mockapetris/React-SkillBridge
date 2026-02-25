import { verifyToken } from '../utils/jwtUtils.js'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  let token

  // Check if token exists in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1]
      console.log(`[AUTH PROTECT] Token found in header: ${token.substring(0, 20)}...`)

      // Verify token
      const decoded = verifyToken(token)
      console.log(`[AUTH PROTECT] Token decoded, userId: ${decoded.id}`)

      if (!decoded) {
        console.log(`[AUTH PROTECT] Token decode failed`)
        return res.status(401).json({ message: 'Not authorized, token failed' })
      }

      // Get user from token id (exclude password)
      req.user = await User.findById(decoded.id).select('-password')
      console.log(`[AUTH PROTECT] User loaded: ${req.user?.firstName} ${req.user?.lastName} (${req.user?._id})`)

      next()
    } catch (error) {
      console.error(`[AUTH PROTECT] Error:`, error.message)
      return res.status(401).json({ message: 'Not authorized, token failed' })
    }
  } else {
    // Only execute this if the first condition fails
    console.log(`[AUTH PROTECT] No Bearer token in Authorization header`)
    console.log(`[AUTH PROTECT] Headers:`, Object.keys(req.headers))
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

export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' })
  }

  if (req.user.userType !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }

  next()
}
