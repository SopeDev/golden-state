import crypto from 'crypto'

export const generateSecureToken = () => crypto.randomBytes(32).toString('hex')

export const hashAuthToken = (token) =>
  crypto.createHash('sha256').update(String(token)).digest('hex')

export const verificationExpiry = () => new Date(Date.now() + 24 * 60 * 60 * 1000)

export const passwordResetExpiry = () => new Date(Date.now() + 60 * 60 * 1000)

export const findUserByHashedToken = async (prisma, field, rawToken, expiresField) => {
  const token = typeof rawToken === 'string' ? rawToken.trim() : ''
  if (!token) return null

  const hashed = hashAuthToken(token)
  const nowFilter = { [expiresField]: { gt: new Date() } }

  const hashedMatch = await prisma.user.findFirst({
    where: { [field]: hashed, ...nowFilter },
  })
  if (hashedMatch) return hashedMatch

  // Legacy plaintext tokens from before hashing shipped.
  return prisma.user.findFirst({
    where: { [field]: token, ...nowFilter },
  })
}
