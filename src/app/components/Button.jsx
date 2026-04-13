'use client'
// Legacy: new screens and refactors use @/components/ui/button — see docs/FASE_2_ARQUITECTURA_SHADCN.md (Fase C).
import Link from 'next/link'

export default function Button({
	children,
	onClick,
	href,
	type = 'button',
	className = '',
	variant = 'primary',
	...props
}) {
	const baseStyles = {
		primary: 'bg-main-blue hover:bg-secondary-blue text-white py-2 px-4 rounded cursor-pointer',
		secondary: 'bg-main-gold hover:bg-secondary-gold text-white py-2 px-4 rounded cursor-pointer',
		action: 'w-full bg-main-gold hover:bg-secondary-gold text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 cursor-pointer',
		ghost: 'text-gray-500 hover:text-gray-300 py-2 px-4 rounded cursor-pointer',
		outlinegold: 'bg-white border border-main-gold text-main-gold hover:bg-main-gold hover:text-white py-2 px-4 rounded transition-colors duration-200 cursor-pointer',
		outlineblue: 'bg-white border border-main-blue text-main-blue hover:bg-main-blue hover:text-white py-2 px-4 rounded transition-colors duration-200 cursor-pointer',
		outlinegoldfull: 'w-full bg-white border-2 border-main-gold text-main-gold hover:bg-main-gold hover:text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 cursor-pointer',
		outlinebluefull: 'w-full bg-white border-2 border-main-blue text-main-blue hover:bg-main-blue hover:text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 cursor-pointer',
		unstyled: 'cursor-pointer',
	}

	const styles = `${baseStyles[variant] || ''} ${className}`

	if (href) {
		return (
			<Link href={href}>
				<button type={type} className={styles} {...props}>
					{children}
				</button>
			</Link>
		)
	}

	return (
		<button type={type} className={styles} onClick={onClick} {...props}>
			{children}
		</button>
	)
}
