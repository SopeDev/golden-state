import VerifiedClient from './VerifiedClient'

export default async function VerifiedPage({ searchParams }) {
  const params = await searchParams
  const needsProfile = params?.next === 'profile'

  return <VerifiedClient needsProfile={needsProfile} />
}
