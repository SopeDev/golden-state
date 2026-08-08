'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import RequiredLabel from '@/components/ui/RequiredLabel'
import PhoneInputField from '@/components/auth/PhoneInputField'
import { adminSelectClassName } from '@/lib/adminFormClasses'
import {
  EXPERIENCE_OPTIONS,
  INVESTMENT_RANGE_OPTIONS,
  LOCATION_OPTIONS,
  defaultLocationFromLocale,
  parseInvestorLocation,
} from '@/lib/auth/investorProfileOptions'
import { getPropertyTypeLabel } from '@/lib/propertyTypes'
import { cn } from '@/lib/utils'

const textareaClassName =
  'flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

export default function ProfileQuestionnaireFields({
  errors = {},
  prefix = '',
  initialProjectTypes = [],
  defaultLocation,
}) {
  const t = useTranslations('Register')
  const locale = useLocale()
  const field = (name) => `${prefix}${name}`
  const selectedTypes = new Set(initialProjectTypes)
  const [location, setLocation] = useState(
    () => parseInvestorLocation(defaultLocation) || defaultLocationFromLocale(locale)
  )
  const [propertyTypes, setPropertyTypes] = useState([])

  useEffect(() => {
    let cancelled = false
    fetch('/api/property-types')
      .then((res) => (res.ok ? res.json() : { types: [] }))
      .then((data) => {
        if (!cancelled) setPropertyTypes(Array.isArray(data.types) ? data.types : [])
      })
      .catch(() => {
        if (!cancelled) setPropertyTypes([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-8 border-t border-border pt-8">
      <div>
        <h3 className="font-heading text-lg font-semibold text-primary">{t('profileTitle')}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t('profileSubtitle')}</p>
        <p className="mt-3 rounded-lg border border-border/70 bg-muted/40 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
          {t('profilePrivacyNote')}
        </p>
      </div>

      <div className="space-y-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t('profileSectionContact')}
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <RequiredLabel htmlFor={field('fullName')}>{t('fullName')}</RequiredLabel>
            <Input id={field('fullName')} name="fullName" required />
            {errors.fullName ? <p className="text-xs text-destructive">{t('errorRequired')}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor={field('phone')}>{t('phone')}</Label>
            <PhoneInputField
              id={field('phone')}
              name="phone"
              locale={locale}
              defaultCountry={location === 'MX' ? 'MX' : location === 'US' ? 'US' : undefined}
              countryLabel={t('phoneCountryCode')}
              numberPlaceholder={t('phoneNumberPlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={field('referralSource')}>{t('referralSource')}</Label>
            <Input id={field('referralSource')} name="referralSource" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <RequiredLabel htmlFor={field('location')}>{t('location')}</RequiredLabel>
            <select
              id={field('location')}
              name="location"
              required
              className={adminSelectClassName()}
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            >
              {LOCATION_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {t(`location_${value}`)}
                </option>
              ))}
            </select>
            {errors.location ? <p className="text-xs text-destructive">{t('errorRequired')}</p> : null}
          </div>
          {location === 'MX' ? (
            <div className="space-y-2 sm:col-span-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/80 bg-background px-3 py-2.5 text-sm transition-colors hover:border-main-gold/40">
                <input
                  type="checkbox"
                  name="interestedInInvestorVisa"
                  className="mt-0.5"
                />
                <span>{t('interestedInInvestorVisa')}</span>
              </label>
              <p className="px-1 text-xs leading-relaxed text-muted-foreground">
                {t('interestedInInvestorVisaDisclaimer')}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t('profileSectionPlans')}
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <RequiredLabel htmlFor={field('investmentRange')}>{t('investmentRange')}</RequiredLabel>
            <select
              id={field('investmentRange')}
              name="investmentRange"
              required
              className={adminSelectClassName()}
              defaultValue=""
            >
              <option value="" disabled>
                {t('selectPlaceholder')}
              </option>
              {INVESTMENT_RANGE_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {t(`range_${value}`)}
                </option>
              ))}
            </select>
            {errors.investmentRange ? (
              <p className="text-xs text-destructive">{t('errorRequired')}</p>
            ) : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <RequiredLabel htmlFor={field('investmentGoals')}>{t('investmentGoals')}</RequiredLabel>
            <textarea
              id={field('investmentGoals')}
              name="investmentGoals"
              rows={3}
              required
              className={textareaClassName}
              placeholder={t('investmentGoalsPlaceholder')}
            />
            {errors.investmentGoals ? (
              <p className="text-xs text-destructive">{t('errorRequired')}</p>
            ) : null}
          </div>

          <div className="space-y-3 sm:col-span-2">
            <div>
              <RequiredLabel>{t('projectTypes')}</RequiredLabel>
              <p className="mt-1 text-xs text-muted-foreground">{t('projectTypesHint')}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {propertyTypes.map((type) => (
                <label
                  key={type.id}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border border-border/80 bg-background px-3 py-2.5 text-sm transition-colors hover:border-main-gold/40',
                    selectedTypes.has(type.code) && 'border-main-gold/50 bg-main-gold/5'
                  )}
                >
                  <input
                    type="checkbox"
                    name="projectTypes"
                    value={type.code}
                    defaultChecked={selectedTypes.has(type.code)}
                    className="mt-0.5"
                  />
                  <span>{getPropertyTypeLabel(type, locale)}</span>
                </label>
              ))}
            </div>
            {errors.projectTypes ? (
              <p className="text-xs text-destructive">{t('errorProjectTypes')}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <RequiredLabel htmlFor={field('experience')}>{t('experience')}</RequiredLabel>
            <select
              id={field('experience')}
              name="experience"
              required
              className={adminSelectClassName()}
              defaultValue=""
            >
              <option value="" disabled>
                {t('selectPlaceholder')}
              </option>
              {EXPERIENCE_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {t(`experience_${value}`)}
                </option>
              ))}
            </select>
            {errors.experience ? <p className="text-xs text-destructive">{t('errorRequired')}</p> : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={field('background')}>{t('background')}</Label>
            <textarea
              id={field('background')}
              name="background"
              rows={3}
              className={textareaClassName}
              placeholder={t('backgroundPlaceholder')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
