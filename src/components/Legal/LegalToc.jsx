export default function LegalToc({ title, sections }) {
  if (!sections?.length) return null

  return (
    <nav aria-label={title} className="lg:sticky lg:top-24">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
      <ul className="mt-4 space-y-1.5">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="block rounded-md px-2 py-1.5 text-sm leading-snug text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
