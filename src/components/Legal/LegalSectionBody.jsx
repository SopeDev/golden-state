import LegalRichText from './LegalRichText'

const listClass = 'mt-3 space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground md:text-base'

export default function LegalSectionBody({ blocks }) {
  if (!blocks?.length) return null

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`

        if (block.type === 'callout') {
          return (
            <div
              key={key}
              className="rounded-xl border border-main-gold/35 bg-main-gold/8 px-4 py-3 text-sm leading-relaxed text-foreground md:text-base"
            >
              <LegalRichText text={block.text} />
            </div>
          )
        }

        if (block.type === 'ul') {
          return (
            <ul key={key} className={`${listClass} list-disc`}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <LegalRichText text={item} />
                </li>
              ))}
            </ul>
          )
        }

        if (block.type === 'ol') {
          return (
            <ol key={key} className={`${listClass} list-decimal`}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <LegalRichText text={item} />
                </li>
              ))}
            </ol>
          )
        }

        if (block.type === 'table') {
          return (
            <div key={key} className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {block.headers.map((header) => (
                      <th
                        key={header}
                        className="border-b border-border px-3 py-2.5 font-semibold text-foreground"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="odd:bg-background even:bg-muted/20">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="border-b border-border/70 px-3 py-2.5 text-muted-foreground">
                          <LegalRichText text={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }

        return (
          <p key={key} className="text-sm leading-relaxed text-muted-foreground md:text-base">
            <LegalRichText text={block.text} />
          </p>
        )
      })}
    </div>
  )
}
