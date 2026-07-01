import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  canAccessPortfolio,
  resolveProtectedPortfolioHref,
} from '@/lib/auth/userStatus'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function DashboardPage() {
  const t = await getTranslations('Dashboard')
  const session = await getServerSession(authOptions)
  const user = session?.user
  const portfolioUnlocked =
    user?.type === 'ADMIN' || (user && canAccessPortfolio(user))
  const portfolioHref = user ? resolveProtectedPortfolioHref(user) : '/login'

  return (
    <div className="flex-1 bg-muted/30">
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <h1 className="mb-10 text-center font-heading text-4xl font-semibold text-primary">
          {t('title')}
        </h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border/80 shadow-sm transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-primary">
                {t('portfolioTitle')}
              </CardTitle>
              <CardDescription>
                {portfolioUnlocked ? t('portfolioDesc') : t('portfolioLockedDesc')}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link
                href={portfolioHref}
                className={cn(
                  buttonVariants({
                    variant: portfolioUnlocked ? 'default' : 'outline',
                    size: 'default',
                  }),
                  'w-full'
                )}
              >
                {portfolioUnlocked ? t('portfolioCta') : t('portfolioLockedCta')}
              </Link>
            </CardFooter>
          </Card>

          <Card className="border-border/80 shadow-sm transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-primary">
                {t('accountTitle')}
              </CardTitle>
              <CardDescription>{t('accountDesc')}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Link
                href="/dashboard/account"
                className={cn(buttonVariants({ variant: 'outline', size: 'default' }), 'w-full')}
              >
                {t('accountCta')}
              </Link>
            </CardFooter>
          </Card>

          <Card className="border-border/80 shadow-sm transition-shadow hover:shadow-md md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-primary">
                {t('projectsTitle')}
              </CardTitle>
              <CardDescription>{t('projectsDesc')}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Link
                href="/projects"
                className={cn(buttonVariants({ variant: 'gold', size: 'cta' }), 'w-full')}
              >
                {t('projectsCta')}
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
