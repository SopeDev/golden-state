'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'

export default function RequestReviewButton({
  scope,
  label,
  pendingLabel,
  needsDocumentsLabel,
  errorLabel,
  variant = 'outline',
  size = 'default',
  className,
  onSuccess,
}) {
  const { update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleClick = async () => {
    setLoading(true)
    setError('')

    const res = await fetch('/api/investor/request-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope }),
    })
    const data = await res.json().catch(() => ({}))
    setLoading(false)

    if (!res.ok) {
      if (data.code === 'needs_documents') {
        setError(needsDocumentsLabel)
        return
      }
      setError(errorLabel)
      return
    }

    setSubmitted(true)
    await update()

    if (onSuccess) {
      onSuccess(data)
      return
    }

    if (scope === 'account') {
      router.push('/account/pending')
    } else {
      router.refresh()
    }
  }

  if (submitted) {
    return <p className="text-sm text-green-700 dark:text-green-400">{pendingLabel}</p>
  }

  return (
    <div className={className}>
      <Button type="button" variant={variant} size={size} disabled={loading} onClick={handleClick}>
        {loading ? '…' : label}
      </Button>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
