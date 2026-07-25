import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import path from 'path'

import { INVESTOR_DOCUMENT_KIND_MAP } from '@/lib/investorDocumentFields'
import { notifyAdminsAccreditationSubmitted } from '@/lib/email/adminNotify'
import { resolveUserLocale } from '@/lib/auth/userLocale'
import { parseResubmitKinds } from '@/lib/investorDocumentResubmit'
import {
  putPrivateObject,
  toClientInvestorDocuments,
} from '@/lib/storage/r2'

const prisma = new PrismaClient()

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
])

const KIND_MAP = INVESTOR_DOCUMENT_KIND_MAP

const sanitizeBaseName = (name) =>
  name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        accreditedStatus: true,
        accreditedSubmittedAt: true,
        accountStatus: true,
        accreditationResubmitKinds: true,
        investorDocuments: { orderBy: { uploadedAt: 'desc' } },
      },
    })
    if (!user) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({
      ...user,
      investorDocuments: toClientInvestorDocuments(user.investorDocuments),
    })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.accountStatus !== 'ACTIVE' && session.user.type !== 'ADMIN') {
    return NextResponse.json({ message: 'Account not active' }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const selfCertify = formData.get('selfCertify') === 'true' || formData.get('selfCertify') === 'on'
    const propertyId = typeof formData.get('propertyId') === 'string' ? formData.get('propertyId') : null

    if (!selfCertify) {
      return NextResponse.json({ message: 'Certification required' }, { status: 400 })
    }

    const userId = session.user.id
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { accreditationResubmitKinds: true },
    })
    const resubmitKinds = parseResubmitKinds(existingUser?.accreditationResubmitKinds)
    const isPartialResubmit = resubmitKinds.length > 0

    const createdDocs = []
    const entries = Object.entries(KIND_MAP).filter(([, kind]) =>
      isPartialResubmit ? resubmitKinds.includes(kind) : true
    )

    for (const [field, kind] of entries) {
      const file = formData.get(field)
      if (!(file instanceof File) || file.size === 0) continue
      if (!ALLOWED_MIME.has(file.type)) {
        return NextResponse.json({ message: `Invalid file type: ${field}` }, { status: 400 })
      }

      await prisma.investorDocument.deleteMany({
        where: { userId, kind },
      })

      const ext = path.extname(file.name) || '.bin'
      const filename = `${field}-${Date.now()}-${sanitizeBaseName(file.name)}${ext}`
      const objectKey = `investors/${userId}/${filename}`
      const buffer = Buffer.from(await file.arrayBuffer())
      await putPrivateObject({
        key: objectKey,
        body: buffer,
        contentType: file.type,
      })

      const doc = await prisma.investorDocument.create({
        data: {
          userId,
          kind,
          fileUrl: objectKey,
          fileName: file.name,
          mimeType: file.type,
        },
      })
      createdDocs.push(doc)
    }

    if (isPartialResubmit) {
      const uploadedKinds = createdDocs.map((doc) => doc.kind)
      const missingKinds = resubmitKinds.filter((kind) => !uploadedKinds.includes(kind))
      if (missingKinds.length > 0) {
        return NextResponse.json({ message: 'All requested documents are required' }, { status: 400 })
      }
    } else if (createdDocs.length === 0) {
      return NextResponse.json({ message: 'At least one document required' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        accreditedStatus: 'PENDING_REVIEW',
        accreditedSubmittedAt: new Date(),
        accreditationResubmitKinds: null,
      },
    })

    const investor = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, profile: true },
    })

    if (investor) {
      const locale = resolveUserLocale(investor)
      try {
        await notifyAdminsAccreditationSubmitted({
          investor,
          documentCount: createdDocs.length,
          locale,
        })
      } catch (emailError) {
        console.error('Accreditation admin notify failed:', emailError)
      }
    }

    if (propertyId) {
      await prisma.investmentIntent.upsert({
        where: {
          userId_propertyId: { userId, propertyId },
        },
        create: {
          userId,
          propertyId,
          status: 'ACCREDITATION_PENDING',
        },
        update: { status: 'ACCREDITATION_PENDING' },
      })
    }

    return NextResponse.json({ ok: true, documents: createdDocs.length })
  } catch (error) {
    console.error('Accreditation submit error:', error)
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
