import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  // Redirection selon le rôle
  if (session.user.role === 'ADMIN') {
    redirect('/admin');
  } else if (session.user.role ===) {
    redirect('/backoffice');
  } else if (session.user.role === 'REFERENT') {
    redirect('/referent');
  } else if (session.user.role === 'VENDEUR') {
    redirect('/vendeur');
  }

  redirect('/auth/signin');
}
