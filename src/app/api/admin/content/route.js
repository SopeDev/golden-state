import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const SUPPORTED_PAGE_KEYS = ['HOME', 'ABOUT', 'FAQ', 'CONTACT']

const isValidContentPayload = (value) => {
  return value && typeof value === 'object' && !Array.isArray(value)
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.type !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pageKey = searchParams.get('pageKey')
    const locale = searchParams.get('locale')

    const records = await prisma.pageContent.findMany({
      where: {
        ...(pageKey ? { pageKey } : {}),
        ...(locale ? { locale } : {}),
      },
      orderBy: [{ pageKey: 'asc' }, { locale: 'asc' }],
    })

    return NextResponse.json(records)
  } catch (error) {
    console.error('Error fetching page content:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.type !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const locale = body.locale?.toLowerCase()

    if (!body.pageKey || !locale || !isValidContentPayload(body.content)) {
      return NextResponse.json(
        { message: 'pageKey, locale and a valid content object are required' },
        { status: 400 }
      )
    }

    if (!SUPPORTED_PAGE_KEYS.includes(body.pageKey)) {
      return NextResponse.json({ message: 'Unsupported pageKey' }, { status: 400 })
    }

    const record = await prisma.pageContent.upsert({
      where: {
        pageKey_locale: {
          pageKey: body.pageKey,
          locale,
        },
      },
      update: {
        content: body.content,
      },
      create: {
        pageKey: body.pageKey,
        locale,
        content: body.content,
      },
    })

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error saving page content:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
