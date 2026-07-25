import { getServerSession } from 'next-auth'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import { redirect } from '@/i18n/navigation'
import {
  groupPropertyDocumentsByKind,
  toClientPropertyDocuments,
} from '@/lib/propertyDocuments'
import PropertyDocumentsPageClient from './PropertyDocumentsPageClient'

const prisma = new PrismaClient()

export default async function PropertyDocumentsPage({ params }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    await redirect('/login')
  }

  const { propertyId } = await params

  try {
    const isAdmin = session.user.type === 'ADMIN'
    if (!isAdmin) {
      const holding = await prisma.investment.findFirst({
        where: {
          propertyId,
          userId: Number(session.user.id),
        },
        select: { id: true },
      })
      if (!holding) {
        await redirect('/dashboard/portfolio')
      }
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        name: true,
        investmentId: true,
        city: true,
        state: true,
        address: true,
      },
    })

    if (!property) {
      await redirect('/dashboard/portfolio')
    }

    const docs = await prisma.propertyDocument.findMany({
      where: { propertyId },
      orderBy: { uploadedAt: 'desc' },
    })

    // Soft navigations keep the root layout mounted, so its message bundle can be
    // stale. Re-provide PropertyDocuments messages for this page on every visit.
    const allMessages = await getMessages()
    const messages = {
      PropertyDocuments: allMessages.PropertyDocuments,
    }

    return (
      <NextIntlClientProvider messages={messages}>
        <PropertyDocumentsPageClient
          property={property}
          documents={toClientPropertyDocuments(docs)}
          groups={groupPropertyDocumentsByKind(docs)}
        />
      </NextIntlClientProvider>
    )
  } catch (error) {
    console.error('Property documents page error:', error)
    await redirect('/dashboard/portfolio')
  } finally {
    await prisma.$disconnect()
  }
}
