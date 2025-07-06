'use client'
import Link from 'next/link'

export default function DropdownNavItem({ label, links = [], t }) {
	return (
		<li className="relative group cursor-pointer">
			<div className="flex items-center gap-1 py-1 px-2 text-main-blue hover:text-secondary-blue">
				{t ? t(label) : label}
				<svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M13.8336 4.4848L8.50022 9.81814L3.16689 4.4848L2.31836 5.33333L8.07596 11.0909C8.31027 11.3252 8.69017 11.3252 8.92449 11.0909L14.6821 5.33333L13.8336 4.4848Z"
						fill="#333333"
					/>
				</svg>
			</div>

			<div className="absolute w-max py-5 left-0 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity flex flex-col bg-white text-black shadow-md rounded z-50 min-w-[150px]">
				{links.map(({ href, label }, index) => (
					<Link key={index} href={href}>
						<div className="px-4 py-2 text-secondaryblue hover:bg-gray-100">
							{t ? t(label) : label}
						</div>
					</Link>
				))}
			</div>
		</li>
	)
}
