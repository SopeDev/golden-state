'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatUsd } from '@/lib/formatMoney'

const RECEIPT_ACCEPT = '.pdf,image/jpeg,image/png,image/webp'

export default function CashOutConfirmDialog({
  open,
  row,
  submitting,
  onClose,
  onConfirm,
}) {
  const t = useTranslations('Admin.returns')
  const [receipt, setReceipt] = useState(null)
  const [adminNote, setAdminNote] = useState('')
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (!open) return
    setReceipt(null)
    setAdminNote('')
    setLocalError('')
  }, [open, row?.id])

  const submit = async (event) => {
    event.preventDefault()
    if (!receipt) {
      setLocalError(t('bankNoticeRequired'))
      return
    }
    setLocalError('')
    await onConfirm({ receipt, adminNote: adminNote.trim() })
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && !submitting && onClose()}>
      <DialogContent showCloseButton={!submitting} className="sm:max-w-md">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t('confirmCashOutTitle')}</DialogTitle>
            <DialogDescription>{t('confirmCashOutDesc')}</DialogDescription>
          </DialogHeader>

          {row ? (
            <p className="text-sm text-foreground">
              <span className="font-semibold tabular-nums">{formatUsd(row.amount)}</span>
              {row.user?.email ? (
                <span className="text-muted-foreground"> · {row.user.email}</span>
              ) : null}
            </p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="cash-out-bank-notice">{t('bankNoticeLabel')}</Label>
            <Input
              id="cash-out-bank-notice"
              type="file"
              accept={RECEIPT_ACCEPT}
              required
              disabled={submitting}
              onChange={(event) => {
                setReceipt(event.target.files?.[0] || null)
                setLocalError('')
              }}
            />
            <p className="text-xs text-muted-foreground">{t('bankNoticeHint')}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cash-out-admin-note">{t('bankNoticeNoteLabel')}</Label>
            <Textarea
              id="cash-out-admin-note"
              value={adminNote}
              disabled={submitting}
              placeholder={t('bankNoticeNotePlaceholder')}
              onChange={(event) => setAdminNote(event.target.value)}
              rows={3}
            />
          </div>

          {localError ? (
            <p className="text-sm text-destructive" role="alert">
              {localError}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              {t('cancelConfirm')}
            </Button>
            <Button type="submit" disabled={submitting || !receipt}>
              {submitting ? t('confirmingCashOut') : t('confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
