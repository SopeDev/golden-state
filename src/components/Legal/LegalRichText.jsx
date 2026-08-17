import { Link } from '@/i18n/navigation'

const TOKEN_RE = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g

const isInternalHref = (href) => href.startsWith('/')

const renderLink = (href, label, key) => {
  const className = 'font-medium text-primary underline-offset-2 hover:underline'

  if (isInternalHref(href)) {
    return (
      <Link key={key} href={href} className={className}>
        {label}
      </Link>
    )
  }

  const isMail = href.startsWith('mailto:')
  return (
    <a
      key={key}
      href={href}
      className={className}
      {...(isMail ? {} : { target: '_blank', rel: 'noreferrer' })}
    >
      {label}
    </a>
  )
}

export default function LegalRichText({ text }) {
  if (!text) return null

  const nodes = []
  let lastIndex = 0
  let match
  const pattern = new RegExp(TOKEN_RE.source, 'g')

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    if (match[1]) {
      nodes.push(
        <strong key={`b-${match.index}`} className="font-semibold text-foreground">
          {match[1]}
        </strong>
      )
    } else {
      nodes.push(renderLink(match[3], match[2], `l-${match.index}`))
    }

    lastIndex = pattern.lastIndex
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}
