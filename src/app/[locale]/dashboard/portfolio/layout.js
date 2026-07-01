import { requirePortfolioAccess } from '@/lib/auth/requireSession'

export default async function PortfolioLayout({ children }) {
  await requirePortfolioAccess()
  return children
}
