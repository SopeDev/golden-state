/** Build a JSON-ready object from a registration / profile form (handles multi-select). */
export function formToProfilePayload(form) {
  const formData = new FormData(form)
  const payload = Object.fromEntries(formData.entries())
  payload.projectTypes = formData.getAll('projectTypes')
  payload.interestedInInvestorVisa = formData.get('interestedInInvestorVisa') === 'on'
  return payload
}
