import { Link } from '@/i18n/navigation'

const linkClass = 'font-medium text-primary underline-offset-2 hover:underline'

export const legalAgreementTags = {
  terms: (chunks) => (
    <Link href="/terms" className={linkClass}>
      {chunks}
    </Link>
  ),
  privacy: (chunks) => (
    <Link href="/privacy" className={linkClass}>
      {chunks}
    </Link>
  ),
  aviso: (chunks) => (
    <Link href="/aviso-de-privacidad" className={linkClass}>
      {chunks}
    </Link>
  ),
}
