import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function DashboardPage() {
  const session = await getServerSession()

  if (!session || !session.user) {
    redirect('/api/auth/signin')
  }

  const t = await getTranslations('Dashboard')

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <h1 className="mb-10 text-center font-heading text-4xl font-semibold text-primary">
          {t('title')}
        </h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="border-border/80 shadow-sm transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="font-heading text-xl text-primary">
                {t('portfolioTitle')}
              </CardTitle>
              <CardDescription>{t('portfolioDesc')}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Link
                href="/dashboard/portfolio"
                className={cn(buttonVariants({ variant: 'default', size: 'default' }), 'w-full')}
              >
                {t('portfolioCta')}
              </Link>
            </CardFooter>
          </Card>

          <Card className="border-border/80 shadow-sm transition-shadow hover:shadow-md">
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
