import { getLegalDocument, getLegalNav, getLegalUi } from '@/lib/legalDocuments'
import LegalHero from './LegalHero'
import LegalRelatedLinks from './LegalRelatedLinks'
import LegalSectionBody from './LegalSectionBody'
import LegalToc from './LegalToc'

export default function LegalDocumentPage({ documentId, locale }) {
  const content = getLegalDocument(documentId, locale)
  const ui = getLegalUi(locale)
  const related = getLegalNav(locale, documentId)

  if (!content) return null

  return (
    <div className="flex-1 bg-background">
      <LegalHero
        eyebrow={content.heroEyebrow}
        title={content.heroTitle}
        subtitle={content.heroSubtitle}
        lastUpdatedLabel={ui.lastUpdatedLabel}
        lastUpdated={content.lastUpdated}
      />

      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <aside className="lg:col-span-3">
            <LegalToc title={ui.tocTitle} sections={content.sections} />
          </aside>

          <article className="min-w-0 lg:col-span-9">
            {content.intro ? (
              <p className="text-base leading-relaxed text-foreground md:text-lg">{content.intro}</p>
            ) : null}

            <div className="mt-10 space-y-12">
              {content.sections.map((section) => (
                <section id={section.id} key={section.id}>
                  <h2 className="font-heading text-2xl font-semibold text-primary md:text-3xl">
                    {section.title}
                  </h2>
                  <div className="mt-4">
                    <LegalSectionBody blocks={section.blocks} />
                  </div>
                </section>
              ))}
            </div>
          </article>
        </div>
      </div>

      <LegalRelatedLinks title={ui.relatedTitle} items={related} />
    </div>
  )
}
