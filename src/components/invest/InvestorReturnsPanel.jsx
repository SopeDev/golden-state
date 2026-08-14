'use client'

import { useTranslations } from 'next-intl'
import { useWalletRequestForm } from '@/hooks/useWalletRequestForm'
import WalletActionCards from '@/components/invest/wallet/WalletActionCards'
import WalletActivityList from '@/components/invest/wallet/WalletActivityList'
import WalletRequestForm from '@/components/invest/wallet/WalletRequestForm'

export default function InvestorReturnsPanel({ wallet, loading, failed, onRefresh }) {
  const t = useTranslations('ActivityPage')
  const form = useWalletRequestForm({ wallet, onSubmitted: onRefresh })

  if (loading) {
    return <p className="text-sm text-muted-foreground">{t('walletLoading')}</p>
  }

  if (failed || !wallet) {
    return <p className="text-sm text-destructive">{t('walletLoadError')}</p>
  }

  return (
    <div className="space-y-6">
      <WalletActionCards form={form} />

      {form.mode ? <WalletRequestForm form={form} /> : null}

      <WalletActivityList activity={wallet.activity || []} />
    </div>
  )
}
