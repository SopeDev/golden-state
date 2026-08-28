'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { adminSelectClassName } from '@/lib/adminFormClasses'
import { GENERAL_INTEREST_VALUE } from '@/lib/careerRoles'
import { cn } from '@/lib/utils'
import { trackGaEvent } from '@/lib/analytics'

const HIGHLIGHT_MS = 1800
const MAX_RESUME_BYTES = 3 * 1024 * 1024
const ALLOWED_RESUME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

export default function WorkWithUsForm({
  content,
  roles,
  selectedRoleId,
  onSelectedRoleChange,
  highlightNonce = 0,
}) {
  const [status, setStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [highlighted, setHighlighted] = useState(false)
  const locale = useLocale()
  const nameInputRef = useRef(null)

  const selectedRole = roles.find((role) => role.id === selectedRoleId)
  const applyingLabel = selectedRole
    ? String(content.formApplyingFor || 'Applying for {role}').replace('{role}', selectedRole.title)
    : ''

  useEffect(() => {
    if (!highlightNonce) return
    setHighlighted(true)
    const clearHighlight = window.setTimeout(() => setHighlighted(false), HIGHLIGHT_MS)
    const focusName = window.setTimeout(() => {
      nameInputRef.current?.focus()
    }, 350)
    return () => {
      window.clearTimeout(clearHighlight)
      window.clearTimeout(focusName)
    }
  }, [highlightNonce])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('')
    setIsSubmitting(true)

    const form = e.target
    const roleId = selectedRoleId || GENERAL_INTEREST_VALUE
    const selectedRole = roles.find((role) => role.id === roleId)
    const resume = form.resume.files?.[0]
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

    if (resume && resume.size > MAX_RESUME_BYTES) {
      setStatus('resumeTooLarge')
      setIsSubmitting(false)
      return
    }
    if (resume && !ALLOWED_RESUME_TYPES.has(resume.type)) {
      setStatus('invalidResume')
      setIsSubmitting(false)
      return
    }

    try {
      const formData = new FormData()
      Object.entries(payload).forEach(([key, value]) => formData.set(key, value || ''))
      formData.set('roleId', roleId)
      formData.set('roleTitle', selectedRole?.title || content.formInterestGeneral)
      formData.set('locale', locale)
      if (resume) formData.set('resume', resume)

      const res = await fetch('/api/work-with-us', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        setStatus('error')
        return
      }

      setStatus('success')
      trackGaEvent('job_application_submit', {
        role_id: roleId,
        role_title: selectedRole?.title || content.formInterestGeneral,
        has_resume: Boolean(resume),
        locale,
      })
      form.reset()
      onSelectedRoleChange?.(GENERAL_INTEREST_VALUE)
    } catch {
      setStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card
      id="work-with-us-form"
      className={cn(
        'border-border/80 shadow-md transition-[box-shadow,border-color] duration-300',
        highlighted && 'border-main-gold shadow-[0_0_0_3px_rgba(212,175,55,0.35)]'
      )}
    >
      <CardHeader className="space-y-2 pb-2">
        <CardTitle className="font-heading text-2xl">{content.formSectionTitle}</CardTitle>
        <CardDescription>{content.formSectionDescription}</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {selectedRole ? (
            <div className="flex items-start gap-3 rounded-lg border border-main-gold/45 bg-main-gold/10 px-4 py-3">
              <Briefcase className="mt-0.5 size-4 shrink-0 text-main-gold" aria-hidden />
              <p className="text-sm font-semibold text-primary">{applyingLabel}</p>
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="careers-interest">{content.formInterestLabel}</Label>
            <select
              id="careers-interest"
              name="roleId"
              className={adminSelectClassName(highlighted ? 'border-main-gold ring-3 ring-main-gold/40' : '')}
              value={selectedRoleId || GENERAL_INTEREST_VALUE}
              onChange={(event) => onSelectedRoleChange?.(event.target.value)}
            >
              <option value={GENERAL_INTEREST_VALUE}>{content.formInterestGeneral}</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.title}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="careers-name">{content.name}</Label>
              <Input
                id="careers-name"
                ref={nameInputRef}
                name="name"
                type="text"
                autoComplete="name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="careers-email">{content.email}</Label>
              <Input id="careers-email" name="email" type="email" autoComplete="email" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="careers-phone">{content.phone}</Label>
            <Input id="careers-phone" name="phone" type="tel" autoComplete="tel" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="careers-message">{content.message}</Label>
            <Textarea
              id="careers-message"
              name="message"
              rows={6}
              required
              className="min-h-[140px] resize-y"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="careers-resume">{content.resumeLabel}</Label>
            <Input
              id="careers-resume"
              name="resume"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
            <p className="text-xs text-muted-foreground">{content.resumeHint}</p>
          </div>

          <p className="text-xs text-muted-foreground">{content.privacyNote}</p>
          {content.eeoNote ? (
            <p className="text-xs leading-relaxed text-muted-foreground">{content.eeoNote}</p>
          ) : null}

          {status === 'success' && (
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              {content.success}
            </p>
          )}
          {status === 'validation' && (
            <p className="text-sm font-medium text-destructive">{content.validationError}</p>
          )}
          {status === 'error' && (
            <p className="text-sm font-medium text-destructive">{content.error}</p>
          )}
          {status === 'resumeTooLarge' && (
            <p className="text-sm font-medium text-destructive">{content.resumeTooLarge}</p>
          )}
          {status === 'invalidResume' && (
            <p className="text-sm font-medium text-destructive">{content.resumeInvalid}</p>
          )}

          <Button
            type="submit"
            className={cn('w-full sm:w-auto')}
            variant="gold"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? content.submitting : content.submit}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
