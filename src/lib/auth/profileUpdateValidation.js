export function validateProfileBasicsUpdate(body) {
  const errors = {}
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''

  if (!fullName) {
    errors.fullName = 'required'
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    data: { fullName, phone },
  }
}

export function validateChangePassword(body) {
  const errors = {}
  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : ''
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword : ''
  const confirmPassword =
    typeof body.confirmPassword === 'string' ? body.confirmPassword : ''

  if (!currentPassword) {
    errors.currentPassword = 'required'
  }
  if (!newPassword || newPassword.length < 8) {
    errors.newPassword = 'password_too_short'
  }
  if (newPassword !== confirmPassword) {
    errors.confirmPassword = 'password_mismatch'
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    data: { currentPassword, newPassword },
  }
}
