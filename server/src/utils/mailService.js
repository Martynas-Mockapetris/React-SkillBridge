import nodemailer from 'nodemailer'
import SystemConfig from '../models/SystemConfig.js'

const toBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true') return true
    if (normalized === 'false') return false
  }
  return fallback
}

const toNumber = (value, fallback) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const getMailSettings = async () => {
  const config = await SystemConfig.findOne().select('mail').lean()
  const values = config?.mail?.values || {}

  const host = values.host || process.env.EMAIL_HOST || ''
  const port = toNumber(values.port ?? process.env.EMAIL_PORT, 587)
  const secure = toBoolean(values.secure ?? process.env.EMAIL_SECURE, false)
  const user = values.user || process.env.EMAIL_USER || ''
  const pass = values.pass || process.env.EMAIL_PASS || ''
  const fromEmail = values.fromEmail || process.env.EMAIL_FROM || user || ''
  const fromName = values.fromName || process.env.EMAIL_FROM_NAME || 'SkillBridge'
  const replyTo = values.replyTo || process.env.EMAIL_REPLY_TO || fromEmail || ''
  const enabled = toBoolean(values.enabled ?? config?.mail?.enabled, true)

  return {
    enabled,
    host,
    port,
    secure,
    user,
    pass,
    fromEmail,
    fromName,
    replyTo
  }
}

const isMailConfigured = (settings) => {
  return Boolean(settings.host && settings.port && settings.user && settings.pass && settings.fromEmail)
}

const createTransporter = (settings) => {
  return nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: {
      user: settings.user,
      pass: settings.pass
    }
  })
}

export const sendMail = async ({ to, subject, text, html }) => {
  const settings = await getMailSettings()

  if (!settings.enabled) {
    return {
      delivered: false,
      reason: 'mail-disabled'
    }
  }

  if (!isMailConfigured(settings)) {
    console.warn('Mail delivery skipped: mail transport is not configured.')

    if (process.env.NODE_ENV !== 'production') {
      console.log('Mail preview:', {
        to,
        subject,
        text,
        html
      })
    }

    return {
      delivered: false,
      reason: 'mail-not-configured'
    }
  }

  const transporter = createTransporter(settings)

  const info = await transporter.sendMail({
    from: `"${settings.fromName}" <${settings.fromEmail}>`,
    to,
    replyTo: settings.replyTo || undefined,
    subject,
    text,
    html
  })

  return {
    delivered: true,
    messageId: info.messageId
  }
}
