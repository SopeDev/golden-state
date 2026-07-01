import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import PortfolioClient from './PortfolioClient'

const prisma = new PrismaClient()

export default async function PortfolioPage() {
  const session = await getServerSession(authOptions)

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        investments: {
          include: {
            property: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!user) {
      return <PortfolioClient investments={[]} />
    }

    return <PortfolioClient investments={user.investments} />
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return <PortfolioClient investments={[]} />
  }
}
