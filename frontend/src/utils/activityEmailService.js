import User from '../models/User.js'
import { sendMail } from './mailService.js'

const getAppBaseUrl = () => {
  return process.env.APP_URL || process.env.CLIENT_URL || 'http://localhost:5173'
}

const buildProfileUrl = (path = '/profile') => {
  const baseUrl = getAppBaseUrl().replace(/\/$/, '')
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

const canReceiveEmailCategory = (user, category) => {
  if (!user) return false
  if (!user.email) return false
  if (user.emailNotificationsEnabled === false) return false

  if (category === 'messages') {
    return user.emailNotificationsMessages !== false
  }

  if (category === 'connections') {
    return user.emailNotificationsConnections !== false
  }

  if (category === 'projects') {
    return user.emailNotificationsProjects !== false
  }

  return true
}

const sendActivityEmail = async ({ to, subject, introLines = [], ctaLabel, ctaUrl }) => {
  const text = [...introLines, '', `${ctaLabel}: ${ctaUrl}`, '', 'You can manage these email preferences in your SkillBridge profile settings.'].join('\n')

  const html = `
    <p>${introLines.join('</p><p>')}</p>
    <p><a href="${ctaUrl}">${ctaLabel}</a></p>
    <p>You can manage these email preferences in your SkillBridge profile settings.</p>
  `

  return sendMail({
    to,
    subject,
    text,
    html
  })
}

export const sendNewMessageEmail = async ({ recipientId, senderName = 'Someone', subject = '' }) => {
  const recipient = await User.findById(recipientId).select('firstName email emailNotificationsEnabled emailNotificationsMessages')

  if (!canReceiveEmailCategory(recipient, 'messages')) {
    return { delivered: false, reason: 'recipient-email-preferences-disabled' }
  }

  const profileUrl = buildProfileUrl('/profile')
  const normalizedSubject = String(subject || '').trim()

  return sendActivityEmail({
    to: recipient.email,
    subject: normalizedSubject ? `New SkillBridge message: ${normalizedSubject}` : 'New SkillBridge message',
    introLines: [`Hi ${recipient.firstName || 'there'},`, normalizedSubject ? `${senderName} sent you a new message about "${normalizedSubject}".` : `${senderName} sent you a new message on SkillBridge.`],
    ctaLabel: 'Open messages',
    ctaUrl: profileUrl
  })
}

export const sendConnectionRequestedEmail = async ({ recipientId, requesterName = 'Someone' }) => {
  const recipient = await User.findById(recipientId).select('firstName email emailNotificationsEnabled emailNotificationsConnections')

  if (!canReceiveEmailCategory(recipient, 'connections')) {
    return { delivered: false, reason: 'recipient-email-preferences-disabled' }
  }

  return sendActivityEmail({
    to: recipient.email,
    subject: 'New SkillBridge connection request',
    introLines: [`Hi ${recipient.firstName || 'there'},`, `${requesterName} sent you a connection request on SkillBridge.`],
    ctaLabel: 'Review connection requests',
    ctaUrl: buildProfileUrl('/profile')
  })
}

export const sendConnectionAcceptedEmail = async ({ recipientId, actorName = 'Someone', actorUserId = '' }) => {
  const recipient = await User.findById(recipientId).select('firstName email emailNotificationsEnabled emailNotificationsConnections')

  if (!canReceiveEmailCategory(recipient, 'connections')) {
    return { delivered: false, reason: 'recipient-email-preferences-disabled' }
  }

  const destination = actorUserId ? `/freelancer/${actorUserId}` : '/profile'

  return sendActivityEmail({
    to: recipient.email,
    subject: 'Your SkillBridge connection request was accepted',
    introLines: [`Hi ${recipient.firstName || 'there'},`, `${actorName} accepted your connection request on SkillBridge.`],
    ctaLabel: 'View profile',
    ctaUrl: buildProfileUrl(destination)
  })
}
