import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { putPublicObject } from '@/lib/storage/r2'
import { hasOperatorPermission, OPERATOR_PERMISSIONS as P } from '@/lib/operatorPermissions'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
const MAX_BYTES = 4 * 1024 * 1024

const safeName = (name) =>
  name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !hasOperatorPermission(session.user, P.EDIT_WEBSITE_CONTENT)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  try {
    const file = (await request.formData()).get('image')
    if (!(file instanceof File) || file.size <= 0) {
      return NextResponse.json({ message: 'Image is required' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ message: 'Image must be JPG, PNG, WebP, or AVIF' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ message: 'Image must be 4 MB or less' }, { status: 413 })
    }

    const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : 'jpg'
    const objectKey = `content/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName(file.name) || 'image'}.${extension}`
    const url = await putPublicObject({
      key: objectKey,
      body: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
    })
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Content image upload error:', error)
    return NextResponse.json({ message: 'Image upload failed' }, { status: 500 })
  }
}
