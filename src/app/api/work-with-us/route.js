import { NextResponse } from 'next/server'
import { getWorkWithUsContent } from '@/lib/pageContent'
import { buildRolesFromContent, GENERAL_INTEREST_VALUE } from '@/lib/careerRoles'
import { notifyAdminsWorkWithUsInquiry } from '@/lib/email/adminNotify'
import { enforceRateLimit, RATE_LIMITS } from '@/lib/security/rateLimit'

export async function POST(request) {
  const limited = enforceRateLimit(request, 'work-with-us', RATE_LIMITS.workWithUs)
  if (limited) return limited

  try {
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    const message = typeof body.message === 'string' ? body.message.trim() : ''
    const requestedRoleId = typeof body.roleId === 'string' ? body.roleId.trim() : GENERAL_INTEREST_VALUE
    const locale = body.locale === 'es' ? 'es' : 'en'

    if (!name || !email || !message) {
      return NextResponse.json({ message: 'Name, email, and message are required' }, { status: 400 })
    }

    const content = await getWorkWithUsContent(locale)
    const roles = buildRolesFromContent(content)
    const matchedRole = roles.find((role) => role.id === requestedRoleId)
    const roleId = matchedRole ? matchedRole.id : GENERAL_INTEREST_VALUE
    const roleTitle = matchedRole
      ? matchedRole.title
      : content.formInterestGeneral || (locale === 'es' ? 'Consulta general' : 'General inquiry')

    const entry = {
      receivedAt: new Date().toISOString(),
      name,
      email,
      phone,
      message,
      roleId,
      roleTitle,
    }

    console.info('[work-with-us]', JSON.stringify(entry))

    notifyAdminsWorkWithUsInquiry({
      name,
      email,
      phone,
      message,
      roleTitle,
      locale,
    }).catch((error) => {
      console.error('Work with us admin notify failed:', error)
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 })
  }
}
