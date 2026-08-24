import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import { putPrivateObject } from '@/lib/storage/r2'
import {
  PROPERTY_DOCUMENT_ALLOWED_MIME,
  isPropertyDocumentKind,
  sanitizeDocumentFileBase,
  toClientPropertyDocuments,
} from '@/lib/propertyDocuments'
import { countUnannouncedDocuments } from '@/lib/investorUpdates'

const prisma = new PrismaClient()

const requireAdmin = async () => {
  const session = await getServerSession(authOptions)
  if (!session || !['ADMIN', 'OPERATOR'].includes(session.user?.type)) {
    return { error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) }
  }
  return { session }
}

export async function GET(_request, { params }) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { id: propertyId } = await params

  try {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, documentsNotifiedAt: true },
    })
    if (!property) {
      return NextResponse.json({ message: 'Property not found' }, { status: 404 })
    }

    const docs = await prisma.propertyDocument.findMany({
      where: { propertyId },
      orderBy: { uploadedAt: 'desc' },
    })

    const unannouncedCount = await countUnannouncedDocuments(prisma, property)

    return NextResponse.json({
      documents: toClientPropertyDocuments(docs),
      unannouncedCount,
      documentsNotifiedAt: property.documentsNotifiedAt,
    })
  } catch (error) {
    console.error('List property documents error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request, { params }) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { id: propertyId } = await params

  try {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    })
    if (!property) {
      return NextResponse.json({ message: 'Property not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const kind = String(formData.get('kind') || '')
    const file = formData.get('file')

    if (!isPropertyDocumentKind(kind)) {
      return NextResponse.json({ message: 'Invalid document type' }, { status: 400 })
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 })
    }

    if (!PROPERTY_DOCUMENT_ALLOWED_MIME.has(file.type)) {
      return NextResponse.json(
        { message: `Unsupported file type: ${file.type || 'unknown'}` },
        { status: 400 }
      )
    }

    const extension = file.name.includes('.')
      ? file.name.split('.').pop().toLowerCase()
      : file.type === 'application/pdf'
        ? 'pdf'
        : 'bin'
    const safeBase = sanitizeDocumentFileBase(file.name) || 'property-doc'
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeBase}.${extension}`
    const storageKey = `properties/${propertyId}/documents/${uniqueName}`

    const bytes = await file.arrayBuffer()
    await putPrivateObject({
      key: storageKey,
      body: Buffer.from(bytes),
      contentType: file.type,
    })

    const doc = await prisma.propertyDocument.create({
      data: {
        propertyId,
        kind,
        storageKey,
        fileName: file.name || uniqueName,
        mimeType: file.type,
        uploadedById: Number(auth.session.user.id) || null,
      },
    })

    return NextResponse.json({ document: toClientPropertyDocuments([doc])[0] })
  } catch (error) {
    console.error('Upload property document error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
