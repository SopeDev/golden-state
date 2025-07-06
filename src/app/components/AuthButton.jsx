'use client'
import Link from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/react'
import Button from './Button'

export default function AuthButton({ t }) {
	const { data: session } = useSession()

	if (session) {
		return (
			<div className="flex items-center gap-2">
				<span className="text-sm text-mainblue">{session?.user?.name}</span>
				<Button onClick={() => signOut()}>
					{t('signOut')}
				</Button>
			</div>
		)
	}

	return (
		<div className="flex items-center gap-2">
			<Button onClick={() => signIn()} variant="primary">
				{t('signIn')}
			</Button>
			<Button href="/register" variant="secondary">
				{t('register')}
			</Button>
		</div>
	)
}
