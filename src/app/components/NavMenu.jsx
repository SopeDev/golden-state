'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import DropdownNavItem from './DropdownNavItem'
import LocaleToggle from './LocaleToggle'
import AuthButton from './AuthButton'

export default function NavMenu({ session }) {
	const t = useTranslations('Navbar')
	const [menuOpen, setMenuOpen] = useState(false)

	return (
		<div
			id="nav"
			className="fixed top-0 z-50 w-screen border-b border-border bg-background py-3 shadow-sm"
		>
			<div className="mx-auto flex w-full max-w-screen-xl items-center justify-between px-3 md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
				{/* 1 — Logo */}
				<div className="shrink-0">
					<Link href="/">
						<img src="/logo.png" alt="Golden State" className="h-13" />
					</Link>
				</div>

				{/* 2 — Primary links */}
				<nav
					className="hidden w-fit shrink-0 lg:flex"
					aria-label={t('primaryNavigation')}
				>
					<ul className="relative flex items-center gap-4">
						<li>
							<Link
								href="/about"
								className="block px-2 py-1 text-primary hover:text-secondary-blue"
							>
								{t('about')}
							</Link>
						</li>
						<DropdownNavItem
							label="projects"
							t={t}
							links={[
								{ href: '/projects', label: 'actualProjects' },
								{ href: '/fliphouses', label: 'fliphouses' },
							]}
						/>
						<DropdownNavItem
							label="investments"
							t={t}
							links={[
								{ href: '/buytorent', label: 'buyToRent' },
								{ href: '/buytobuild', label: 'buyToBuild' },
								{ href: '/mexicotous', label: 'mexicoToUs' },
							]}
						/>
						{session?.user && (
							<DropdownNavItem
								label="account"
								t={t}
								links={[
									{ href: '/dashboard', label: 'dashboard' },
									{ href: '/dashboard/portfolio', label: 'portfolio' },
								]}
							/>
						)}
						<div className="hidden shrink-0 items-center lg:flex">
							<LocaleToggle />
						</div>
					</ul>
				</nav>

				{/* 3 — Language */}

				{/* 4 — CTAs */}
				<div className="hidden shrink-0 items-center gap-3 lg:flex">
					{session?.user?.type === 'ADMIN' && (
						<Link
							href="/admin/data"
							className={cn(
								buttonVariants({ variant: 'outline', size: 'sm' }),
								'border-main-gold text-main-gold hover:bg-main-gold/10'
							)}
						>
							Admin
						</Link>
					)}
					<AuthButton t={t} />
				</div>

				{/* Mobile menu control */}
				<div className="flex shrink-0 items-center lg:hidden">
					<button
						type="button"
						className="cursor-pointer"
						onClick={() => setMenuOpen(!menuOpen)}
						aria-label="Toggle menu"
					>
						<svg
							className="h-8 w-8 cursor-pointer text-secondary-blue"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							{menuOpen ? (
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							) : (
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 4h20M6 12h16M10 20h12" />
							)}
						</svg>
					</button>
				</div>
			</div>

			{menuOpen && (
				<div className="mt-3 flex flex-col gap-2 bg-background px-4 lg:hidden">
					<hr />
					<span className="text-lg">Info</span>
					<Link href="/about" onClick={() => setMenuOpen(false)}>
						<div className="py-1 text-sm text-primary hover:text-secondary-blue">{t('about')}</div>
					</Link>
					<hr />
					<span className="text-lg">{t('actualProjects')}</span>
					<Link href="/projects" onClick={() => setMenuOpen(false)}>
						<div className="py-1 text-sm text-primary hover:text-secondary-blue">{t('actualProjects')}</div>
					</Link>
					<Link href="/fliphouses" onClick={() => setMenuOpen(false)}>
						<div className="py-1 text-sm text-primary hover:text-secondary-blue">{t('fliphouses')}</div>
					</Link>
					<hr />
					<span className="text-lg">{t('investments')}</span>
					<Link href="/buytorent" onClick={() => setMenuOpen(false)}>
						<div className="py-1 text-sm text-primary hover:text-secondary-blue">{t('buyToRent')}</div>
					</Link>
					<Link href="/buytobuild" onClick={() => setMenuOpen(false)}>
						<div className="py-1 text-sm text-primary hover:text-secondary-blue">{t('buyToBuild')}</div>
					</Link>
					<Link href="/mexicotous" onClick={() => setMenuOpen(false)}>
						<div className="py-1 text-sm text-primary hover:text-secondary-blue">{t('mexicoToUs')}</div>
					</Link>
					{session?.user && (
						<>
							<hr />
							<span className="text-lg">{t('account')}</span>
							<Link href="/dashboard" onClick={() => setMenuOpen(false)}>
								<div className="py-1 text-sm text-primary hover:text-secondary-blue">{t('dashboard')}</div>
							</Link>
							<Link href="/dashboard/portfolio" onClick={() => setMenuOpen(false)}>
								<div className="py-1 text-sm text-primary hover:text-secondary-blue">{t('portfolio')}</div>
							</Link>
						</>
					)}
					<hr />
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex justify-center sm:justify-start">
							<LocaleToggle />
						</div>
						<div className="flex justify-center sm:justify-end">
							<AuthButton t={t} />
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
