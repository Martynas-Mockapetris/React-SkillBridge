import crypto from 'crypto'

export const hashToken = (value) => {
  return crypto.createHash('sha256').update(String(value)).digest('hex')
}

export const createSecureToken = ({ size = 32, ttlMinutes = 60 } = {}) => {
  const rawToken = crypto.randomBytes(size).toString('hex')

  return {
    rawToken,
    tokenHash: hashToken(rawToken),
    expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000)
  }
}

export const isTokenExpired = (expiresAt) => {
  if (!expiresAt) return true
  return new Date(expiresAt).getTime() <= Date.now()
}
