'use client'

import { signOut, useSession } from 'next-auth/react'
import { Link, useRouter } from '@/i18n/navigation'
import { Button, buttonVariants } from '@/components/ui/button'

export default function AuthButton({ t }) {
	const { data: session } = useSession()
	const router = useRouter()

	const handleSignOut = async () => {
		await signOut({ redirect: false })
		router.push('/')
		router.refresh()
	}

	if (session) {
		return (
			<div className="flex items-center gap-2">
				<Button type="button" variant="default" onClick={handleSignOut}>
					{t('signOut')}
				</Button>
			</div>
		)
	}

	return (
		<div className="flex items-center gap-2">
			<Link href="/login" className={buttonVariants({ variant: 'default', size: 'default' })}>
				{t('signIn')}
			</Link>
			<Link
				href="/register"
				className={buttonVariants({ variant: 'gold', size: 'default' })}
			>
				{t('register')}
			</Link>
		</div>
	)
}
