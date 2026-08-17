'use client'

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

export default function NotifyDocumentsDialog({
  open,
  uploadedCount,
  notifying,
  onSkip,
  onNotify,
}) {
  const t = useTranslations('PropertyDocuments')
  const count = uploadedCount || 0

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && !notifying && onSkip()}>
      <DialogContent showCloseButton={!notifying} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('notifyPromptTitle')}</DialogTitle>
          <DialogDescription>
            {t('notifyPromptBody', { count })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onSkip} disabled={notifying}>
            {t('notifySkip')}
          </Button>
          <Button type="button" onClick={onNotify} disabled={notifying}>
            {notifying ? t('notifying') : t('notifyNow')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
