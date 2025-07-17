import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import NavMenu from './NavMenu';

export default async function NavMenuServer() {
  const session = await getServerSession(authOptions);
  return <NavMenu session={session} />;
} 