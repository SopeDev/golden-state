'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
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
import { cn } from '@/lib/utils'

const MessagingContext = createContext(null)

const normalizeOptions = (input) => {
  if (typeof input === 'string') return { message: input }
  return input && typeof input === 'object' ? input : { message: '' }
}

export function MessagingProvider({ children }) {
  const t = useTranslations('Messaging')
  const [dialog, setDialog] = useState(null)
  const [promptValue, setPromptValue] = useState('')
  const resolverRef = useRef(null)
  const inputRef = useRef(null)

  const closeDialog = useCallback((result) => {
    const resolve = resolverRef.current
    resolverRef.current = null
    setDialog(null)
    setPromptValue('')
    resolve?.(result)
  }, [])

  const openDialog = useCallback((nextDialog) => {
    return new Promise((resolve) => {
      if (resolverRef.current) {
        resolverRef.current(nextDialog.kind === 'confirm' ? false : nextDialog.kind === 'prompt' ? null : undefined)
      }
      resolverRef.current = resolve
      setPromptValue(nextDialog.defaultValue || '')
      setDialog(nextDialog)
    })
  }, [])

  const alert = useCallback(
    async (input) => {
      const options = normalizeOptions(input)
      return openDialog({
        kind: 'alert',
        title: options.title || t('alertTitle'),
        message: options.message || '',
        confirmLabel: options.confirmLabel || t('ok'),
        actionLabel: options.actionLabel || null,
        variant: options.variant || 'default',
      })
    },
    [openDialog, t]
  )

  const confirm = useCallback(
    async (input) => {
      const options = normalizeOptions(input)
      return openDialog({
        kind: 'confirm',
        title: options.title || t('confirmTitle'),
        message: options.message || '',
        confirmLabel: options.confirmLabel || t('confirm'),
        cancelLabel: options.cancelLabel || t('cancel'),
        variant: options.variant || 'default',
      })
    },
    [openDialog, t]
  )

  const prompt = useCallback(
    async (input) => {
      const options = normalizeOptions(input)
      return openDialog({
        kind: 'prompt',
        title: options.title || t('promptTitle'),
        message: options.message || '',
        confirmLabel: options.confirmLabel || t('confirm'),
        cancelLabel: options.cancelLabel || t('cancel'),
        placeholder: options.placeholder || t('promptPlaceholder'),
        defaultValue: options.defaultValue || '',
        label: options.label || t('promptLabel'),
        variant: options.variant || 'default',
      })
    },
    [openDialog, t]
  )

  const value = useMemo(() => ({ alert, confirm, prompt }), [alert, confirm, prompt])

  const handleOpenChange = (open) => {
    if (!open && dialog) {
      if (dialog.kind === 'confirm') closeDialog(false)
      else if (dialog.kind === 'prompt') closeDialog(null)
      else closeDialog(undefined)
    }
  }

  const confirmVariant = dialog?.variant === 'destructive' ? 'destructive' : 'default'
  const isPrompt = dialog?.kind === 'prompt'

  return (
    <MessagingContext.Provider value={value}>
      {children}
      <Dialog open={Boolean(dialog)} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="gap-0 overflow-hidden p-0 sm:max-w-md"
          initialFocus={isPrompt ? inputRef : undefined}
        >
          {dialog ? (
            <>
              <div className="border-b border-main-gold/30 bg-gradient-to-br from-main-gold/10 via-background to-background px-5 py-4">
                <DialogHeader className="pr-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-main-gold">
                    {t('eyebrow')}
                  </p>
                  <DialogTitle className="mt-1">{dialog.title}</DialogTitle>
                  {dialog.message ? (
                    <DialogDescription className="mt-2 whitespace-pre-line">
                      {dialog.message}
                    </DialogDescription>
                  ) : null}
                </DialogHeader>
              </div>

              <div className={cn('space-y-4 px-5', isPrompt ? 'pt-4' : 'pt-0')}>
                {isPrompt ? (
                  <div className="space-y-2">
                    <Label htmlFor="messaging-prompt-input">{dialog.label}</Label>
                    <Input
                      ref={inputRef}
                      id="messaging-prompt-input"
                      value={promptValue}
                      placeholder={dialog.placeholder}
                      onChange={(event) => setPromptValue(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          closeDialog(promptValue)
                        }
                      }}
                    />
                  </div>
                ) : null}

                <DialogFooter className="border-0 px-0 pb-5 pt-4">
                  {dialog.kind === 'alert' && dialog.actionLabel ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => closeDialog('dismiss')}
                    >
                      {dialog.confirmLabel}
                    </Button>
                  ) : null}
                  {dialog.kind !== 'alert' ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => closeDialog(dialog.kind === 'prompt' ? null : false)}
                    >
                      {dialog.cancelLabel}
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant={
                      dialog.kind === 'alert' && dialog.actionLabel
                        ? 'default'
                        : confirmVariant
                    }
                    onClick={() => {
                      if (dialog.kind === 'alert') {
                        closeDialog(dialog.actionLabel ? 'action' : undefined)
                      } else if (dialog.kind === 'confirm') {
                        closeDialog(true)
                      } else {
                        closeDialog(promptValue)
                      }
                    }}
                  >
                    {dialog.kind === 'alert' && dialog.actionLabel
                      ? dialog.actionLabel
                      : dialog.confirmLabel}
                  </Button>
                </DialogFooter>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </MessagingContext.Provider>
  )
}

export function useMessaging() {
  const context = useContext(MessagingContext)
  if (!context) {
    throw new Error('useMessaging must be used within MessagingProvider')
  }
  return context
}
