export const sessionUserSelect = {
  id: true,
  email: true,
  type: true,
  accountStatus: true,
  accreditedStatus: true,
  profile: true,
  provider: true,
  emailVerifiedAt: true,
  sessionEpoch: true,
  operatorPermissions: true,
}

export const userSecretOmit = {
  password: true,
  emailVerificationToken: true,
  passwordResetToken: true,
}
