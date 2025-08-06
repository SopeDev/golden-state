'use client'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Button from './Button'
import DropdownNavItem from './DropdownNavItem'
import LocaleToggle from './LocaleToggle'
import AuthButton from './AuthButton'

export default function NavMenu({ session }) {
	const pathName = usePathname()
	const t = useTranslations('Navbar')
	const [menuOpen, setMenuOpen] = useState(false)

	return (
		<div id="nav" className="fixed top-0 py-3 w-screen shadow-md bg-white z-50">
			<div className="flex items-center justify-between px-3 mx-auto md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
				{/* Logo */}
				<div>
					<Link href="/">
						<img src="/logo.png" className="h-13" />
					</Link>
				</div>

				{/* Desktop nav */}
				<ul className="hidden lg:flex gap-4 items-center relative">
					<Link href="/about">
						<li className="py-1 px-2 text-main-blue hover:text-secondary-blue">
							{t('about')}
						</li>
					</Link>
					<DropdownNavItem
						label="projects"
						t={t}
						links={[
							{ href: '/projects', label: 'actualProjects' },
							{ href: '/fliphouses', label: 'fliphouses' }
						]}
					/>
					<DropdownNavItem
						label="investments"
						t={t}
						links={[
							{ href: '/buytorent', label: 'buyToRent' },
							{ href: '/buytobuild', label: 'buyToBuild' },
							{ href: '/mexicotous', label: 'mexicoToUs' }
						]}
					/>
					{session?.user && (
						<DropdownNavItem
							label="account"
							t={t}
							links={[
								{ href: '/dashboard', label: 'dashboard' },
								{ href: '/dashboard/portfolio', label: 'portfolio' }
							]}
						/>
					)}
				</ul>

				{/* Right-side controls */}
				<div className="hidden lg:flex items-center gap-2">
					<LocaleToggle />
					{session?.user?.type === 'ADMIN' && (
						<Button href="/admin/data" variant="outlinegold">Admin</Button>
					)}
					<AuthButton t={t} />
				</div>

				{/* Mobile menu toggle */}
				<div className="lg:hidden flex items-center">
					<button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
						<svg
							className="w-8 h-8 text-secondary-blue cursor-pointer"
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

			{/* Mobile Menu */}
			{menuOpen && (
				<div className="lg:hidden mt-3 px-4 flex flex-col gap-2 bg-white">
					<hr/>
					<label className="text-lg">Info</label>
					<Link href="/about">
						<div className="py-1 text-sm text-main-blue hover:text-secondary-blue">{t('about')}</div>
					</Link>
					<hr/>
					<label className="text-lg">{t('actualProjects')}</label>
					<Link href="/projects">
						<div className="py-1 text-sm text-main-blue hover:text-secondary-blue">{t('actualProjects')}</div>
					</Link>
					<Link href="/fliphouses">
						<div className="py-1 text-sm text-main-blue hover:text-secondary-blue">{t('fliphouses')}</div>
					</Link>
					<hr/>
					<label className="text-lg">{t('investments')}</label>
					<Link href="/buytorent">
						<div className="py-1 text-sm text-main-blue hover:text-secondary-blue">{t('buyToRent')}</div>
					</Link>
					<Link href="/buytobuild">
						<div className="py-1 text-sm text-main-blue hover:text-secondary-blue">{t('buyToBuild')}</div>
					</Link>
					<Link href="/mexicotous">
						<div className="py-1 text-sm text-main-blue hover:text-secondary-blue">{t('mexicoToUs')}</div>
					</Link>
					{session?.user && (
						<>
							<hr/>
							<label className="text-lg">{t('account')}</label>
							<Link href="/dashboard">
								<div className="py-1 text-sm text-main-blue hover:text-secondary-blue">{t('dashboard')}</div>
							</Link>
							<Link href="/dashboard/portfolio">
								<div className="py-1 text-sm text-main-blue hover:text-secondary-blue">{t('portfolio')}</div>
							</Link>
						</>
					)}
					<hr/>
					<div className="flex items-center gap-2 justify-between">
						<LocaleToggle />
						<AuthButton t={t} />
					</div>
				</div>
			)}
		</div>
	)
}
