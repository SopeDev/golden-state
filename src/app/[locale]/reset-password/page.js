import { Suspense } from 'react'
import ResetPasswordClient from './ResetPasswordClient'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-muted/30" />}>
      <ResetPasswordClient />
    </Suspense>
  )
}
