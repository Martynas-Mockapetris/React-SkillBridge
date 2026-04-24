import { createSecureToken } from './authTokenUtils.js'
import { sendMail } from './mailService.js'

const EMAIL_VERIFICATION_TTL_MINUTES = 60 * 24

const getAppBaseUrl = () => {
  return process.env.APP_URL || process.env.CLIENT_URL || 'http://localhost:5173'
}

const buildEmailVerificationUrl = (rawToken) => {
  const baseUrl = getAppBaseUrl().replace(/\/$/, '')
  return `${baseUrl}/verify-email?token=${encodeURIComponent(rawToken)}`
}

export const sendVerificationEmail = async (user) => {
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
