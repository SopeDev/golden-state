'use client'
import { signIn, signOut, useSession } from 'next-auth/react'
import { Link } from '@/i18n/navigation'
import { Button, buttonVariants } from '@/components/ui/button'

export default function AuthButton({ t }) {
	const { data: session } = useSession()

	if (session) {
		return (
			<div className="flex items-center gap-2">
				<Button type="button" variant="default" onClick={() => signOut()}>
					{t('signOut')}
				</Button>
			</div>
		)
	}

	return (
		<div className="flex items-center gap-2">
			<Button type="button" variant="default" onClick={() => signIn()}>
				{t('signIn')}
			</Button>
			<Link
				href="/register"
				className={buttonVariants({ variant: 'gold', size: 'default' })}
			>
				{t('register')}
			</Link>
		</div>
	)
}
