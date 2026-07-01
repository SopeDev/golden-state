'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { CalendarClock, Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const DEFAULT_SCHEDULING_URL = 'https://calendly.com/goldenstate-capital/discovery-call'

export default function ContactPageClient() {
  const t = useTranslations('Contact')
  const [status, setStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const schedulingUrl = useMemo(() => {
    const fromEnv = process.env.NEXT_PUBLIC_CONTACT_SCHEDULING_URL
    if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) return fromEnv.trim()
    return DEFAULT_SCHEDULING_URL
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('')
    setIsSubmitting(true)

    const form = e.target
    const payload = {
      name: form.name.value?.trim(),
      email: form.email.value?.trim(),
      phone: form.phone.value?.trim(),
      message: form.message.value?.trim(),
    }

    if (!payload.name || !payload.email || !payload.message) {
      setStatus('validation')
      setIsSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        setStatus('error')
        return
      }

      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 bg-background">
      <section className="relative overflow-hidden border-b border-border text-primary-foreground">
        <div className="absolute inset-0">
          <Image
            src="/images/contact_1920.webp"
            alt="Contact hero background"
            fill
            priority
            className="object-cover object-[60%_center]"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/82 via-primary/72 to-secondary-blue/60" aria-hidden />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(13,38,66,0.4),transparent_60%)]" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(212,175,55,0.22),transparent_40%)]" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="max-w-3xl">
            <h1 className="font-heading text-3xl font-semibold md:text-5xl">{t('heroTitle')}</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-primary-foreground/92 md:text-lg">
              {t('heroThanks')}
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-primary-foreground/88 md:text-lg">
              {t('heroInvite')}
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-14">
          <Card className="overflow-hidden border-main-gold/35 shadow-md">
            <div className="grid gap-0 md:grid-cols-[1fr_minmax(0,380px)]">
              <CardHeader className="space-y-4 bg-gradient-to-br from-muted/60 to-background p-8 md:p-10">
                <div className="flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-main-gold/15 text-main-gold">
                    <CalendarClock className="size-6" aria-hidden />
                  </span>
                  <div>
                    <CardTitle className="font-heading text-2xl text-primary">{t('scheduleTitle')}</CardTitle>
                    <CardDescription className="mt-1 text-base text-muted-foreground">
                      {t('scheduleDescription')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col justify-center gap-2 border-t border-border/80 bg-card p-8 md:border-l md:border-t-0 md:p-10">
                <Button asChild size="lg" className="w-full sm:w-auto sm:self-start" variant="gold">
                  <a href={schedulingUrl} target="_blank" rel="noopener noreferrer">
                    {t('scheduleCta')}
                  </a>
                </Button>
                <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">{t('scheduleFootnote')}</p>
              </CardContent>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-8 lg:col-span-5">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-primary md:text-3xl">{t('officeTitle')}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t('contactDisclaimer')}</p>
            </div>

            <Card className="border-border/80 shadow-sm">
              <CardContent className="space-y-6 p-6 md:p-8">
                <div className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <MapPin className="size-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-main-gold">Office</p>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-foreground">
                      {t('officeAddress')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Phone className="size-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-main-gold">{t('phoneLabel')}</p>
                    <a
                      href={`tel:${t('phoneHref')}`}
                      className="mt-1 block text-sm font-medium text-secondary-blue hover:underline"
                    >
                      {t('phoneValue')}
                    </a>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Mail className="size-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-main-gold">{t('emailLabel')}</p>
                    <a
                      href={`mailto:${t('emailValue')}`}
                      className="mt-1 block text-sm font-medium text-secondary-blue hover:underline break-all"
                    >
                      {t('emailValue')}
                    </a>
                  </div>
                </div>
                <div className="flex gap-4 border-t border-border pt-6">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                    <Clock className="size-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-main-gold">{t('hoursLabel')}</p>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {t('hoursValue')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7">
            <Card className="border-border/80 shadow-md">
              <CardHeader className="space-y-2 pb-2">
                <CardTitle className="font-heading text-2xl">{t('formSectionTitle')}</CardTitle>
                <CardDescription>{t('formSectionDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">{t('name')}</Label>
                      <Input id="contact-name" name="name" type="text" autoComplete="name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">{t('email')}</Label>
                      <Input id="contact-email" name="email" type="email" autoComplete="email" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-phone">{t('phone')}</Label>
                    <Input id="contact-phone" name="phone" type="tel" autoComplete="tel" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-message">{t('message')}</Label>
                    <Textarea id="contact-message" name="message" rows={6} required className="min-h-[140px] resize-y" />
                  </div>

                  <p className="text-xs text-muted-foreground">{t('privacyNote')}</p>

                  {status === 'success' && (
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{t('success')}</p>
                  )}
                  {status === 'validation' && (
                    <p className="text-sm font-medium text-destructive">{t('validationError')}</p>
                  )}
                  {status === 'error' && (
                    <p className="text-sm font-medium text-destructive">{t('error')}</p>
                  )}

                  <Button type="submit" className={cn('w-full sm:w-auto')} variant="gold" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? t('submitting') : t('submit')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
