import { createSecureToken } from './authTokenUtils.js'
import { sendMail } from './mailService.js'

const DEFAULT_PASSWORD_RESET_TTL_MINUTES = 60

const getAppBaseUrl = () => {
  return process.env.APP_URL || process.env.CLIENT_URL || 'http://localhost:5173'
}

const buildPasswordResetUrl = (rawToken) => {
  const baseUrl = getAppBaseUrl().replace(/\/$/, '')
  return `${baseUrl}/reset-password?token=${encodeURIComponent(rawToken)}`
}

export const sendPasswordResetEmail = async (user, options = {}) => {
  const { ttlMinutes = DEFAULT_PASSWORD_RESET_TTL_MINUTES, forcePasswordReset = false } = options

  const { rawToken, tokenHash, expiresAt } = createSecureToken({
    ttlMinutes
  })

  user.passwordResetTokenHash = tokenHash
  user.passwordResetTokenExpiresAt = expiresAt
  user.passwordResetRequestedAt = new Date()

  if (forcePasswordReset) {
    user.forcePasswordReset = true
    user.forcePasswordResetSetAt = new Date()
  }

  await user.save()

  const resetUrl = buildPasswordResetUrl(rawToken)
  const subject = 'Reset your SkillBridge password'
  const text = [
    `Hi ${user.firstName || 'there'},`,
    '',
    'We received a request to reset your SkillBridge password.',
    `Reset link: ${resetUrl}`,
    '',
    `This link expires in ${ttlMinutes} minutes.`,
    'If you did not request this, you can ignore this email.'
  ].join('\n')

  const html = `
    <p>Hi ${user.firstName || 'there'},</p>
    <p>We received a request to reset your SkillBridge password.</p>
    <p><a href="${resetUrl}">Reset password</a></p>
    <p>This link expires in ${ttlMinutes} minutes.</p>
    <p>If you did not request this, you can ignore this email.</p>
  `

  return sendMail({
    to: user.email,
    subject,
    text,
    html
  })
}
