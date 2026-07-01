import { getTranslations } from 'next-intl/server'
import AccountRejectedActions from './AccountRejectedActions'

export default async function AccountRejectedContent() {
  const t = await getTranslations('Account')

  return (
    <div className="flex-1 bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16 md:px-6 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {t('rejectedEyebrow')}
        </p>
        <h1 className="mt-4 font-heading text-3xl leading-tight text-primary md:text-4xl">
          {t('rejectedTitle')}
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
          {t('rejectedLead')}
        </p>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {t('rejectedContactHint')}
        </p>
        <AccountRejectedActions />
      </div>
    </div>
  )
}
