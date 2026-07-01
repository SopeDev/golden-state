import { Suspense } from 'react'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-muted/30" />}>
      <LoginForm />
    </Suspense>
  )
}
