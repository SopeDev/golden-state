import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from '@/i18n/navigation'
import { PrismaClient } from '@prisma/client'
import { resolveInvestorOnboardingPath } from '@/lib/auth/userStatus'
import { SITE_NAME, buildPageMetadata } from '@/lib/seo'
import {
  enrichPropertyWithFunding,
  isPropertyOpenForInvestment,
} from '@/lib/propertyFunding'
import { propertyTypeInclude, toClientProperty } from '@/lib/propertyTypes'
import InvestFlowClient from './InvestFlowClient'

const prisma = new PrismaClient()

export async function generateMetadata({ params }) {
  const { locale, investmentId } = await params
  return buildPageMetadata({
    locale,
    path: `/properties/${investmentId}/invest`,
    title: `Invest | ${SITE_NAME}`,
    noIndex: true,
  })
}

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
    include: propertyTypeInclude,
  })

  if (!property) {
    await prisma.$disconnect()
    await redirect('/projects')
  }

  if (!isPropertyOpenForInvestment(property.status)) {
    await prisma.$disconnect()
    await redirect(`/properties/${property.investmentId}`)
  }

  const enrichedProperty = await enrichPropertyWithFunding(
    prisma,
    toClientProperty(property)
  )
  await prisma.$disconnect()

  return <InvestFlowClient property={enrichedProperty} />
}
