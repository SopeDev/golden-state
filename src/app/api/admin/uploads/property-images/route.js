import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])

const sanitizeBaseName = (name) => {
  return name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.type !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('images')

    if (!files.length) {
      return NextResponse.json({ message: 'No files provided' }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'properties')
    await mkdir(uploadDir, { recursive: true })

    const uploadedUrls = []

    for (const file of files) {
      if (!(file instanceof File)) {
        continue
      }

      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return NextResponse.json(
          { message: `Unsupported image type: ${file.type || 'unknown'}` },
          { status: 400 }
        )
      }

      const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : 'jpg'
      const safeBase = sanitizeBaseName(file.name) || 'property-image'
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeBase}.${extension}`
      const filePath = path.join(uploadDir, uniqueName)

      const bytes = await file.arrayBuffer()
      await writeFile(filePath, Buffer.from(bytes))
      uploadedUrls.push(`/uploads/properties/${uniqueName}`)
    }

    return NextResponse.json({ urls: uploadedUrls })
  } catch (error) {
    console.error('Error uploading property images:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
