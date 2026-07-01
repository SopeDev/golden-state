'use client'

import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import RequiredLabel from '@/components/ui/RequiredLabel'
import { adminSelectClassName } from '@/lib/adminFormClasses'
import {
  EXPERIENCE_OPTIONS,
  INVESTMENT_RANGE_OPTIONS,
  QUESTIONNAIRE_PROPERTY_TYPES,
} from '@/lib/auth/investorProfileOptions'
import { getPropertyTypeLabelKey } from '@/lib/propertyTypeUi'
import { cn } from '@/lib/utils'

const textareaClassName =
  'flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

export default function ProfileQuestionnaireFields({
  errors = {},
  prefix = '',
  initialProjectTypes = [],
}) {
  const t = useTranslations('Register')
  const tProjects = useTranslations('Projects')
  const field = (name) => `${prefix}${name}`
  const selectedTypes = new Set(initialProjectTypes)

  return (
    <div className="space-y-8 border-t border-border pt-8">
      <div>
        <h3 className="font-heading text-lg font-semibold text-primary">{t('profileTitle')}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t('profileSubtitle')}</p>
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
            <Input id={field('phone')} name="phone" type="tel" autoComplete="tel" />
          </div>
          <div className="space-y-2">
            <Label htmlFor={field('referralSource')}>{t('referralSource')}</Label>
            <Input id={field('referralSource')} name="referralSource" />
          </div>
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
              {QUESTIONNAIRE_PROPERTY_TYPES.map((type) => (
                <label
                  key={type}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border border-border/80 bg-background px-3 py-2.5 text-sm transition-colors hover:border-main-gold/40',
                    selectedTypes.has(type) && 'border-main-gold/50 bg-main-gold/5'
                  )}
                >
                  <input
                    type="checkbox"
                    name="projectTypes"
                    value={type}
                    defaultChecked={selectedTypes.has(type)}
                    className="mt-0.5"
                  />
                  <span>{tProjects(getPropertyTypeLabelKey(type))}</span>
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
