'use client'
import { Link } from '@/i18n/navigation'

export default function DropdownNavItem({ label, links = [], t }) {
  return (
    <li className="group relative cursor-pointer">
      <div className="flex items-center gap-1 px-2 py-1 text-primary hover:text-secondary-blue">
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

      <div className="pointer-events-none absolute left-0 z-50 flex min-w-[150px] w-max flex-col rounded bg-card py-1 text-card-foreground opacity-0 shadow-md ring-1 ring-border transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
        {links.map((link, index) =>
          link.divider ? (
            <div
              key={`divider-${index}`}
              className="border-t border-border"
              role="separator"
            />
          ) : (
            <Link key={link.href || index} href={link.href}>
              <div className="px-4 py-1.5 text-secondary-blue hover:bg-muted">
                {link.text != null ? link.text : t ? t(link.label) : link.label}
              </div>
            </Link>
          )
        )}
      </div>
    </li>
  )
}
