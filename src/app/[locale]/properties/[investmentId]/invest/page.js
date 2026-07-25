import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import { PrismaClient } from '@prisma/client'
import { resolveInvestorOnboardingPath } from '@/lib/auth/userStatus'
import InvestFlowClient from './InvestFlowClient'

const prisma = new PrismaClient()

export default async function InvestPage({ params }) {
  const { investmentId } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    await redirect(`/login?callbackUrl=/properties/${investmentId}/invest`)
  }

  if (session.user.type !== 'ADMIN') {
    const onboardingPath = resolveInvestorOnboardingPath(session.user)
    if (onboardingPath) await redirect(onboardingPath)
  }

  const property = await prisma.property.findFirst({
    where: { investmentId: parseInt(investmentId, 10), deletedAt: null },
  })

  await prisma.$disconnect()

  if (!property) {
    await redirect('/projects')
  }

  return <InvestFlowClient property={property} />
}
