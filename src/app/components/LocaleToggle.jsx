'use client'

import { usePathname, useRouter } from '@/i18n/navigation'
import { useParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { routing } from '@/i18n/routing'

export default function LocaleToggle() {
	const pathname = usePathname()
	const router = useRouter()
	const params = useParams()
	const currentLocale = useLocale()

	const switchLocale = (targetLocale) => {
		router.replace(
			{ pathname, params },
			{ locale: targetLocale }
		)
	}

	return (
		<div className="flex gap-2">
			{routing.locales.map((loc) => (
				<button
					key={loc}
					onClick={() => switchLocale(loc)}
					className={`px-2 py-1 rounded cursor-pointer mr-3 ${
						currentLocale === loc
							? 'hidden'
							: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
					}`}
				>
					{loc.toUpperCase()}
				</button>
			))}
		</div>
	)
}
