import { Link } from '@/i18n/navigation'

export default function LegalRelatedLinks({ title, items }) {
  if (!items?.length) return null

  return (
    <section className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        <h2 className="font-heading text-xl font-semibold text-primary">{title}</h2>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="font-medium text-primary underline-offset-2 hover:underline">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
