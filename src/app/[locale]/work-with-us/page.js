import WorkWithUsPage from '@/components/WorkWithUs/WorkWithUsPage'
import { getWorkWithUsContent } from '@/lib/pageContent'
import { buildRolesFromContent, GENERAL_INTEREST_VALUE } from '@/lib/careerRoles'
import { buildPageMetadata } from '@/lib/seo'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { hasOperatorPermission, OPERATOR_PERMISSIONS as P } from '@/lib/operatorPermissions'

export async function generateMetadata({ params }) {
  const { locale } = await params
  const content = await getWorkWithUsContent(locale)

  return buildPageMetadata({
    locale,
    path: '/work-with-us',
    title: content.metaTitle,
    description: content.metaDescription,
  })
}

export default async function WorkWithUsRoute({ params, searchParams }) {
  const { locale } = await params
  const query = await searchParams
  const content = await getWorkWithUsContent(locale)
  const session = await getServerSession(authOptions)
  const canManageRoles = hasOperatorPermission(session?.user, P.EDIT_WEBSITE_CONTENT)
  const roleContentByLocale = canManageRoles
    ? {
        en: await getWorkWithUsContent('en'),
        es: await getWorkWithUsContent('es'),
      }
    : null
  const roles = buildRolesFromContent(content)
  const requestedRole = typeof query?.role === 'string' ? query.role : ''
  const initialRoleId = roles.some((role) => role.id === requestedRole)
    ? requestedRole
    : GENERAL_INTEREST_VALUE

  return (
    <WorkWithUsPage
      content={content}
      roles={roles}
      initialRoleId={initialRoleId}
      roleContentByLocale={roleContentByLocale}
    />
  )
}
