import crypto from 'crypto'

export const generateSecureToken = () => crypto.randomBytes(32).toString('hex')

export const verificationExpiry = () => new Date(Date.now() + 24 * 60 * 60 * 1000)

export const passwordResetExpiry = () => new Date(Date.now() + 60 * 60 * 1000)
