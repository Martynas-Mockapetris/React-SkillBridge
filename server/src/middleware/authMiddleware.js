import { verifyToken } from '../utils/jwtUtils.js'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  let token

  // Check if token exists in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1]

      // Verify token
      const decoded = verifyToken(token)

      if (!decoded) {
        return res.status(401).json({ message: 'Not authorized, token failed' })
      }

      // Get user from token id (exclude password)
      req.user = await User.findById(decoded.id).select('-password')

      next()
    } catch (error) {
      console.error(error)
      res.status(401).json({ message: 'Not authorized, token failed' })
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' })
  }
}
