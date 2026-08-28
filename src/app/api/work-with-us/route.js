import { NextResponse } from 'next/server'
import { getWorkWithUsContent } from '@/lib/pageContent'
import { buildRolesFromContent, GENERAL_INTEREST_VALUE } from '@/lib/careerRoles'
import { notifyAdminsWorkWithUsInquiry } from '@/lib/email/adminNotify'
import { enforceRateLimit, RATE_LIMITS } from '@/lib/security/rateLimit'

const MAX_RESUME_BYTES = 3 * 1024 * 1024
const ALLOWED_RESUME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const safeFileName = (name) =>
  String(name || 'resume')
    .replace(/[\r\n]/g, '')
    .replace(/[^a-zA-Z0-9._ -]/g, '_')
    .slice(0, 120)

export async function POST(request) {
  const limited = enforceRateLimit(request, 'work-with-us', RATE_LIMITS.workWithUs)
  if (limited) return limited

  try {
    const body = await request.formData()
    const name = typeof body.get('name') === 'string' ? body.get('name').trim() : ''
    const email = typeof body.get('email') === 'string' ? body.get('email').trim() : ''
    const phone = typeof body.get('phone') === 'string' ? body.get('phone').trim() : ''
    const message = typeof body.get('message') === 'string' ? body.get('message').trim() : ''
    const requestedRoleId = typeof body.get('roleId') === 'string'
      ? body.get('roleId').trim()
      : GENERAL_INTEREST_VALUE
    const locale = body.get('locale') === 'es' ? 'es' : 'en'
    const resumeEntry = body.get('resume')
    const resume = resumeEntry instanceof File && resumeEntry.size > 0 ? resumeEntry : null

    if (!name || !email || !message) {
      return NextResponse.json({ message: 'Name, email, and message are required' }, { status: 400 })
    }
    if (resume?.size > MAX_RESUME_BYTES) {
      return NextResponse.json({ message: 'Resume must be 3 MB or less' }, { status: 413 })
    }
    if (resume && !ALLOWED_RESUME_TYPES.has(resume.type)) {
      return NextResponse.json({ message: 'Resume must be PDF, DOC, or DOCX' }, { status: 400 })
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

    await notifyAdminsWorkWithUsInquiry({
      name,
      email,
      phone,
      message,
      roleTitle,
      locale,
      resume: resume
        ? {
            filename: safeFileName(resume.name),
            content: Buffer.from(await resume.arrayBuffer()),
            contentType: resume.type,
          }
        : null,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Work with us submission failed:', error)
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 })
  }
}
