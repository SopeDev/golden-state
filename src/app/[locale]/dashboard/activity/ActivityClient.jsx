'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ArrowRight, BadgeCheck, Clock3, TrendingUp, Wallet } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { formatUsd } from '@/lib/formatMoney'
import {
  ACTIVITY_TABS,
  countOpenRequests,
  resolveActivityNextAction,
  resolveDefaultActivityTab,
} from '@/lib/investorActivity'
import { useInvestmentIntents } from '@/hooks/useInvestmentIntents'
import { useInvestorWallet } from '@/hooks/useInvestorWallet'
import ActivityNextAction from '@/components/invest/ActivityNextAction'
import InvestmentRequestsPanel from '@/components/invest/InvestmentRequestsPanel'
import InvestorReturnsPanel from '@/components/invest/InvestorReturnsPanel'

function SummaryTile({ label, value, icon: Icon, valueClassName }) {
  return (
    <Card className="border-border/80 py-0 shadow-sm">
      <CardContent className="flex items-center justify-between px-5 py-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={cn('text-3xl font-semibold text-primary', valueClassName)}>{value}</p>
        </div>
        {Icon ? <Icon className="h-8 w-8 shrink-0 text-main-gold" /> : null}
      </CardContent>
    </Card>
  )
}

export default function ActivityClient() {
  const t = useTranslations('ActivityPage')
  const intentsState = useInvestmentIntents()
  const walletState = useInvestorWallet()
  const [tab, setTab] = useState(null)

  const { intents } = intentsState
  const { wallet } = walletState
  const ready = !intentsState.loading && !walletState.loading

  useEffect(() => {
    if (!ready) return
    setTab((current) => current ?? resolveDefaultActivityTab({ intents, wallet }))
  }, [ready, intents, wallet])

  const openRequests = countOpenRequests(intents)
  const nextAction = useMemo(
    () => (ready ? resolveActivityNextAction({ intents }) : null),
    [ready, intents]
  )

  const refreshAll = async () => {
    await Promise.all([intentsState.reload(), walletState.reload()])
  }

  return (
    <div className="flex-1 bg-background">
      <header className="bg-primary py-12 text-primary-foreground md:py-16">
        <div className="container mx-auto px-4">
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'mb-4 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground'
            )}
          >
            {t('backToDashboard')}
          </Link>
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">{t('title')}</h1>
          <p className="mt-3 text-lg text-primary-foreground/85">{t('subtitle')}</p>
        </div>
      </header>

      <div className="container mx-auto space-y-8 px-4 py-10 md:px-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
          <SummaryTile
            label={t('lifetimeCredited')}
            value={formatUsd(wallet?.lifetimeCredited, { fallback: '$0' })}
            icon={TrendingUp}
            valueClassName="text-main-gold"
          />
          <SummaryTile
            label={t('availableBalance')}
            value={formatUsd(wallet?.available, { fallback: '$0' })}
            icon={Wallet}
          />
          <SummaryTile
            label={t('reserved')}
            value={formatUsd(wallet?.reserved, { fallback: '$0' })}
            icon={Clock3}
          />
          <SummaryTile
            label={t('paid')}
            value={formatUsd(wallet?.paid, { fallback: '$0' })}
            icon={BadgeCheck}
          />
        </div>

        <ActivityNextAction action={nextAction} />

        <Tabs value={tab || ACTIVITY_TABS.requests} onValueChange={setTab} className="gap-4">
          <TabsList
            variant="line"
            className="h-auto w-full flex-wrap justify-start gap-1 rounded-none border-b border-border/70 bg-transparent p-0"
          >
            <TabsTrigger value={ACTIVITY_TABS.requests} className="px-3 py-2">
              {t('tabRequests')}
              {openRequests > 0 ? (
                <span className="ml-1.5 rounded-full bg-main-gold/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  {openRequests}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value={ACTIVITY_TABS.wallet} className="px-3 py-2">
              {t('tabWallet')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={ACTIVITY_TABS.requests} keepMounted className="outline-none">
            <Card className="border-border/80 shadow-sm">
              <CardContent className="space-y-4 px-5 md:px-6">
                <p className="text-sm text-muted-foreground">{t('requestsDesc')}</p>
                <InvestmentRequestsPanel
                  intents={intents}
                  loading={intentsState.loading}
                  failed={intentsState.failed}
                  onRefresh={refreshAll}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value={ACTIVITY_TABS.wallet} keepMounted className="outline-none">
            <Card className="border-border/80 shadow-sm">
              <CardContent className="space-y-4 px-5 md:px-6">
                <p className="text-sm text-muted-foreground">{t('returnsDesc')}</p>
                <InvestorReturnsPanel
                  wallet={wallet}
                  loading={walletState.loading}
                  failed={walletState.failed}
                  onRefresh={walletState.reload}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <section className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-muted/30 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <p className="font-heading text-lg font-semibold text-primary">
              {t('portfolioCrossLinkTitle')}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{t('portfolioCrossLinkDesc')}</p>
          </div>
          <Link
            href="/dashboard/portfolio"
            className={cn(buttonVariants({ variant: 'outline', size: 'default' }), 'shrink-0 gap-1.5')}
          >
            {t('portfolioCrossLinkCta')}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </section>
      </div>
    </div>
  )
}
