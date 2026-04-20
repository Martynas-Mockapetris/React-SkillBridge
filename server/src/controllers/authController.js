import User from '../models/User.js'
import { generateToken } from '../utils/jwtUtils.js'
import { createSecureToken, hashToken, isTokenExpired } from '../utils/authTokenUtils.js'
import { sendMail } from '../utils/mailService.js'
import { sendPasswordResetEmail } from '../utils/accountRecoveryService.js'

const EMAIL_VERIFICATION_TTL_MINUTES = 60 * 24
const EMAIL_VERIFICATION_RESEND_COOLDOWN_MS = 60 * 1000
const PASSWORD_RESET_REQUEST_COOLDOWN_MS = 60 * 1000

const getAppBaseUrl = () => {
  return process.env.APP_URL || process.env.CLIENT_URL || 'http://localhost:5173'
}

const buildEmailVerificationUrl = (rawToken) => {
  const baseUrl = getAppBaseUrl().replace(/\/$/, '')
  return `${baseUrl}/verify-email?token=${encodeURIComponent(rawToken)}`
}

const buildAuthUserResponse = (user, includeToken = false) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  userType: user.userType,
  isLocked: user.isLocked,
  lastLogin: user.lastLogin,
  isEmailVerified: user.isEmailVerified,
  emailVerifiedAt: user.emailVerifiedAt,
  forcePasswordReset: user.forcePasswordReset,
  ...(includeToken ? { token: generateToken(user._id) } : {})
})

const sendVerificationEmail = async (user) => {
  const { rawToken, tokenHash, expiresAt } = createSecureToken({
    ttlMinutes: EMAIL_VERIFICATION_TTL_MINUTES
  })

  user.emailVerificationTokenHash = tokenHash
  user.emailVerificationTokenExpiresAt = expiresAt
  user.emailVerificationLastSentAt = new Date()
  await user.save()

  const verificationUrl = buildEmailVerificationUrl(rawToken)
  const subject = 'Verify your SkillBridge email'
  const text = [
    `Hi ${user.firstName || 'there'},`,
    '',
    'Please verify your email address for your SkillBridge account.',
    `Verification link: ${verificationUrl}`,
    '',
    `This link expires in ${EMAIL_VERIFICATION_TTL_MINUTES / 60} hours.`
  ].join('\n')

  const html = `
    <p>Hi ${user.firstName || 'there'},</p>
    <p>Please verify your email address for your SkillBridge account.</p>
    <p><a href="${verificationUrl}">Verify email</a></p>
    <p>This link expires in ${EMAIL_VERIFICATION_TTL_MINUTES / 60} hours.</p>
  `

  return sendMail({
    to: user.email,
    subject,
    text,
    html
  })
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, userType } = req.body

    // Check if user exists
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      userType
    })

    if (user) {
      await sendVerificationEmail(user)
      res.status(201).json(buildAuthUserResponse(user, true))
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })

    // Check if user exists and password matches
    if (user && (await user.comparePassword(password))) {
      user.lastLogin = new Date()
      await user.save()

      res.json(buildAuthUserResponse(user, true))
    } else {
      res.status(401).json({ message: 'Invalid email or password' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user._id)

    if (user) {
      res.json(buildAuthUserResponse(user))
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Send or resend email verification link
// @route   POST /api/auth/verify-email/request
// @access  Private
export const requestEmailVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.isEmailVerified) {
      return res.json({
        message: 'Email is already verified.',
        isEmailVerified: true
      })
    }

    const lastSentAt = user.emailVerificationLastSentAt ? new Date(user.emailVerificationLastSentAt).getTime() : 0
    const now = Date.now()

    if (lastSentAt && now - lastSentAt < EMAIL_VERIFICATION_RESEND_COOLDOWN_MS) {
      const retryAfterSeconds = Math.ceil((EMAIL_VERIFICATION_RESEND_COOLDOWN_MS - (now - lastSentAt)) / 1000)

      return res.status(429).json({
        message: `Please wait ${retryAfterSeconds} seconds before requesting another verification email.`
      })
    }

    const mailResult = await sendVerificationEmail(user)

    res.json({
      message: mailResult.delivered ? 'Verification email sent.' : 'Verification link generated, but email delivery is not configured.',
      delivery: mailResult
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Confirm email verification token
// @route   POST /api/auth/verify-email/confirm
// @access  Public
export const confirmEmailVerification = async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required.' })
    }

    const tokenHash = hashToken(token)

    const user = await User.findOne({ emailVerificationTokenHash: tokenHash }).select('+emailVerificationTokenHash +emailVerificationTokenExpiresAt')

    if (!user || !user.emailVerificationTokenExpiresAt || isTokenExpired(user.emailVerificationTokenExpiresAt)) {
      return res.status(400).json({ message: 'Verification link is invalid or has expired.' })
    }

    user.isEmailVerified = true
    user.emailVerifiedAt = new Date()
    user.emailVerificationTokenHash = null
    user.emailVerificationTokenExpiresAt = null
    await user.save()

    res.json({
      message: 'Email verified successfully.',
      user: buildAuthUserResponse(user)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Request password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const user = await User.findOne({ email: normalizedEmail })

    const genericResponse = {
      message: 'If an account with that email exists, a password reset link has been sent.'
    }

    if (!user) {
      return res.json(genericResponse)
    }

    const lastRequestedAt = user.passwordResetRequestedAt ? new Date(user.passwordResetRequestedAt).getTime() : 0
    const now = Date.now()

    if (lastRequestedAt && now - lastRequestedAt < PASSWORD_RESET_REQUEST_COOLDOWN_MS) {
      return res.json(genericResponse)
    }

    await sendPasswordResetEmail(user)

    return res.json(genericResponse)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required.' })
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' })
    }

    const tokenHash = hashToken(token)

    const user = await User.findOne({ passwordResetTokenHash: tokenHash }).select('+passwordResetTokenHash +passwordResetTokenExpiresAt')

    if (!user || !user.passwordResetTokenExpiresAt || isTokenExpired(user.passwordResetTokenExpiresAt)) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired.' })
    }

    user.password = password
    user.passwordResetTokenHash = null
    user.passwordResetTokenExpiresAt = null
    user.passwordResetRequestedAt = null
    user.forcePasswordReset = false
    user.forcePasswordResetSetAt = null
    await user.save()

    res.json({
      message: 'Password has been reset successfully.'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
