import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { PrismaClient } from '@prisma/client'
import { ArrowRight, Activity, Bell, Briefcase, Building2, ShieldCheck, UserRound } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatUsd } from '@/lib/formatMoney'
import { investorHoldingWhere } from '@/lib/fundingContributions'
import { getWalletBalance } from '@/lib/investorWallet'
import {
  canAccessPortfolio,
  resolveProtectedPortfolioHref,
  resolveProtectedUpdatesHref,
} from '@/lib/auth/userStatus'
import { getInvestorAdminPhase } from '@/lib/admin/userTimeline'

const prisma = new PrismaClient()

function displayName(user, profile) {
  const fullName = typeof profile?.fullName === 'string' ? profile.fullName.trim() : ''
  if (fullName) return fullName.split(/\s+/)[0]
  const email = user?.email || ''
  const local = email.split('@')[0] || ''
  if (!local) return null
  return local.charAt(0).toUpperCase() + local.slice(1)
}

function NextStepLink({ href, title, body, note, cta, variant = 'default' }) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-main-gold">
          {title}
        </p>
        <p className="mt-2 font-heading text-2xl font-semibold text-primary md:text-3xl">{body}</p>
        {note ? (
          <p className="mt-2 text-sm text-muted-foreground">{note}</p>
        ) : null}
      </div>
      <Link
        href={href}
        className={cn(
          buttonVariants({ variant, size: variant === 'gold' ? 'cta' : 'default' }),
          'shrink-0 gap-2'
        )}
      >
        {cta}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  )
}

export default async function DashboardPage() {
  const t = await getTranslations('Dashboard')
  const tAccount = await getTranslations('MyAccount')
  const session = await getServerSession(authOptions)
  const user = session?.user
  const isAdmin = user?.type === 'ADMIN'
  const portfolioHref = user ? resolveProtectedPortfolioHref(user) : '/login'
  const updatesHref = user ? resolveProtectedUpdatesHref(user) : '/login'

  let totalInvested = 0
  let holdingCount = 0
  let openRequests = []
  let profile = null
  let walletAvailable = 0

  try {
    if (user?.id && !isAdmin) {
      const userId = Number(user.id)
      const [agg, intents, dbUser, wallet] = await Promise.all([
        prisma.fundingContribution.aggregate({
          where: investorHoldingWhere(userId),
          _sum: { amount: true },
          _count: { _all: true },
        }),
        prisma.investmentIntent.findMany({
          where: {
            userId,
            status: { in: ['MEETING_REQUESTED', 'AWAITING_WIRE'] },
          },
          include: {
            property: {
              select: { name: true, investmentId: true },
            },
          },
          orderBy: { updatedAt: 'desc' },
          take: 4,
        }),
        prisma.user.findUnique({
          where: { id: userId },
          select: { profile: true },
        }),
        getWalletBalance(prisma, userId),
      ])
      totalInvested = Number(agg._sum.amount || 0)
      holdingCount = agg._count._all || 0
      openRequests = intents
      profile = dbUser?.profile && typeof dbUser.profile === 'object' ? dbUser.profile : null
      walletAvailable = wallet.available
    } else if (user?.id && isAdmin) {
      const dbUser = await prisma.user.findUnique({
        where: { id: Number(user.id) },
        select: { profile: true },
      })
      profile = dbUser?.profile && typeof dbUser.profile === 'object' ? dbUser.profile : null
    }
  } catch (error) {
    console.error('Dashboard snapshot failed:', error)
  } finally {
    await prisma.$disconnect()
  }

  const firstName = displayName(user, profile)
  const accountStatus = user?.accountStatus
  const accreditedStatus = user?.accreditedStatus || 'NOT_STARTED'
  const onboardingPhase = !isAdmin
    ? getInvestorAdminPhase({
        ...user,
        profile,
      })
    : null
  const investingUnlocked = isAdmin || accreditedStatus === 'APPROVED'
  const portfolioUnlocked = investingUnlocked
  const investmentsUnlocked = investingUnlocked
  const awaitingWire = openRequests.find((row) => row.status === 'AWAITING_WIRE')
  const meetingRequested = openRequests.find((row) => row.status === 'MEETING_REQUESTED')

  let nextStep = {
    href: '/projects',
    title: t('nextStepBrowseEyebrow'),
    body: t('nextStepBrowseBody'),
    cta: t('projectsCta'),
    variant: 'gold',
  }

  if (!isAdmin && onboardingPhase && onboardingPhase !== 'ACTIVE') {
    if (onboardingPhase === 'PENDING_EMAIL') {
      nextStep = {
        href: '/register/check-email',
        title: t('nextStepAccountEyebrow'),
        body: t('nextStepAccountBody.PENDING_EMAIL'),
        cta: t('nextStepAccountCta'),
        variant: 'default',
      }
    } else if (onboardingPhase === 'PENDING_PROFILE') {
      nextStep = {
        href: '/account/complete-profile',
        title: t('nextStepAccountEyebrow'),
        body: t('nextStepAccountBody.PENDING_PROFILE'),
        cta: tAccount('completeProfileCta'),
        variant: 'gold',
      }
    } else if (onboardingPhase === 'REJECTED') {
      nextStep = {
        href: '/dashboard/account',
        title: t('nextStepAccountEyebrow'),
        body: t('nextStepAccountBody.REJECTED'),
        cta: t('nextStepAccountCta'),
        variant: 'default',
      }
    } else {
      nextStep = {
        href: '/account/pending',
        title: t('nextStepAccountEyebrow'),
        body: t('nextStepAccountBody.PENDING_ADMIN'),
        cta: t('nextStepAccountCta'),
        variant: 'default',
      }
    }
  } else if (!isAdmin && accreditedStatus !== 'APPROVED') {
    nextStep = {
      href:
        accreditedStatus === 'PENDING_REVIEW'
          ? '/dashboard/account'
          : '/dashboard/account/accreditation',
      title: t('nextStepAccreditationEyebrow'),
      body: t(`nextStepAccreditationBody.${accreditedStatus}`),
      cta:
        accreditedStatus === 'PENDING_REVIEW'
          ? t('accountCta')
          : t('nextStepAccreditationCta'),
      variant: accreditedStatus === 'PENDING_REVIEW' ? 'outline' : 'gold',
    }
  } else if (awaitingWire?.property?.investmentId) {
    nextStep = {
      href: `/properties/${awaitingWire.property.investmentId}/invest`,
      title: t('nextStepDepositEyebrow'),
      body: t('nextStepDepositBody', { property: awaitingWire.property.name }),
      cta: t('nextStepDepositCta'),
      variant: 'gold',
    }
  } else if (meetingRequested) {
    nextStep = {
      href: '/dashboard/activity',
      title: t('nextStepMeetingEyebrow'),
      body: t('nextStepMeetingBody'),
      note: t('nextStepMeetingNote'),
      cta: t('investmentsCta'),
      variant: 'default',
    }
  } else if (canAccessPortfolio(user) && holdingCount > 0) {
    nextStep = {
      href: portfolioHref,
      title: t('nextStepPortfolioEyebrow'),
      body: t('nextStepPortfolioBody'),
      cta: t('portfolioCta'),
      variant: 'default',
    }
  }

  const destinations = [
    {
      href: portfolioHref,
      icon: Briefcase,
      title: t('portfolioTitle'),
      desc: portfolioUnlocked ? t('portfolioDesc') : t('portfolioLockedDesc'),
      cta: portfolioUnlocked ? t('portfolioCta') : t('portfolioLockedCta'),
      disabled: !portfolioUnlocked,
    },
    {
      href: '/dashboard/activity',
      icon: Activity,
      title: t('investmentsTitle'),
      desc: investmentsUnlocked ? t('investmentsDesc') : t('investmentsLockedDesc'),
      cta: investmentsUnlocked ? t('investmentsCta') : t('investmentsLockedCta'),
      badge: investmentsUnlocked && openRequests.length > 0 ? String(openRequests.length) : null,
      disabled: !investmentsUnlocked,
    },
    {
      href: updatesHref,
      icon: Bell,
      title: t('updatesTitle'),
      desc: investmentsUnlocked ? t('updatesDesc') : t('updatesLockedDesc'),
      cta: investmentsUnlocked ? t('updatesCta') : t('updatesLockedCta'),
      disabled: !investmentsUnlocked,
    },
    {
      href: '/dashboard/account',
      icon: UserRound,
      title: t('accountTitle'),
      desc: t('accountDesc'),
      cta: t('accountCta'),
    },
    {
      href: '/projects',
      icon: Building2,
      title: t('projectsTitle'),
      desc: t('projectsDesc'),
      cta: t('projectsCta'),
    },
  ]

  return (
    <div className="flex-1 bg-background">
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 60% at 10% 20%, rgba(201,162,39,0.28), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 80%, rgba(255,255,255,0.08), transparent 50%)',
          }}
          aria-hidden
        />
        <div className="relative container mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-main-gold">
            {t('eyebrow')}
          </p>
          <h1 className="mt-4 max-w-3xl font-heading text-4xl font-semibold tracking-tight md:text-5xl">
            {firstName ? t('welcomeNamed', { name: firstName }) : t('welcome')}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-primary-foreground/80 md:text-lg">
            {t('subtitle')}
          </p>

          {!isAdmin ? (
            <div className="mt-8 flex flex-wrap gap-2">
              {onboardingPhase ? (
                <span className="rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground">
                  {tAccount(`accountStatus.${onboardingPhase}`)}
                </span>
              ) : accountStatus ? (
                <span className="rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground">
                  {tAccount(`accountStatus.${accountStatus}`)}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-main-gold/40 bg-main-gold/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-main-gold">
                <ShieldCheck className="size-3.5" aria-hidden />
                {tAccount(`accreditedStatus.${accreditedStatus}`)}
              </span>
            </div>
          ) : (
            <p className="mt-6 text-sm text-primary-foreground/70">{t('adminNote')}</p>
          )}
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        {!isAdmin ? (
          <div className="grid gap-px overflow-hidden rounded-2xl border border-border/80 bg-border/80 sm:grid-cols-3">
            <div className="bg-background px-5 py-6 md:px-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {t('statRequests')}
              </p>
              <p className="mt-2 font-heading text-3xl font-semibold text-primary">
                {openRequests.length}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{t('statRequestsHint')}</p>
              {investmentsUnlocked ? (
                <Link
                  href="/dashboard/activity"
                  className="mt-3 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {t('statRequestsCta')}
                </Link>
              ) : null}
            </div>
            <div className="bg-background px-5 py-6 md:px-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {t('statInvested')}
              </p>
              <p className="mt-2 font-heading text-3xl font-semibold text-primary">
                {formatUsd(totalInvested, { fallback: '$0' })}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('statHoldings', { count: holdingCount })}
              </p>
            </div>
            <div className="bg-background px-5 py-6 md:px-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {t('statReturns')}
              </p>
              <p className="mt-2 font-heading text-3xl font-semibold text-primary">
                {formatUsd(walletAvailable, { fallback: '$0' })}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{t('statReturnsHint')}</p>
              <Link
                href="/dashboard/activity"
                className="mt-3 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                {t('statReturnsCta')}
              </Link>
            </div>
          </div>
        ) : null}

        <section
          className={cn(
            'rounded-2xl border border-border/80 bg-muted/40 px-5 py-7 md:px-8 md:py-8',
            !isAdmin ? 'mt-8' : ''
          )}
        >
          <NextStepLink {...nextStep} />
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-2xl font-semibold text-primary">{t('destinationsTitle')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('destinationsDesc')}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {destinations.map((item) => {
              const Icon = item.icon
              const cardClassName = cn(
                'flex h-full items-start gap-4 rounded-2xl border border-border/70 bg-background px-5 py-5',
                item.disabled
                  ? 'cursor-not-allowed opacity-60'
                  : 'group transition-colors hover:border-primary/30 hover:bg-muted/30'
              )
              const content = (
                <>
                  <span
                    className={cn(
                      'mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full',
                      item.disabled ? 'bg-muted text-muted-foreground' : 'bg-primary/5 text-primary'
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          'font-heading text-lg font-semibold',
                          item.disabled ? 'text-muted-foreground' : 'text-primary'
                        )}
                      >
                        {item.title}
                      </span>
                      {item.badge ? (
                        <span className="rounded-full bg-secondary-blue px-2 py-0.5 text-[10px] font-bold text-white">
                          {item.badge}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">{item.desc}</span>
                    <span
                      className={cn(
                        'mt-3 inline-flex items-center gap-1 text-sm font-medium',
                        item.disabled ? 'text-muted-foreground' : 'text-primary'
                      )}
                    >
                      {item.cta}
                      {!item.disabled ? (
                        <ArrowRight
                          className="size-3.5 transition-transform group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      ) : null}
                    </span>
                  </span>
                </>
              )

              return (
                <li key={item.href + item.title}>
                  {item.disabled ? (
                    <div className={cardClassName} aria-disabled="true">
                      {content}
                    </div>
                  ) : (
                    <Link href={item.href} className={cardClassName}>
                      {content}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </div>
  )
}
