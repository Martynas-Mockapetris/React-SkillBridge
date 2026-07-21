import jwt from 'jsonwebtoken'
import Logger from './logger.js'

const logger = new Logger('JWTUtils')

// Generate token for authenticated users
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  })
}

// Verify a token is valid
export const verifyToken = (token) => {
  try {
    logger.debug('Verifying token with secret length:', process.env.JWT_SECRET.length)
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    logger.error('Token verification error:', error.message)
    return null
  }
}
