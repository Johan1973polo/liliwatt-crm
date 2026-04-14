import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import AvatarAssignment from './AvatarAssignment';

export default async function AdminAvatarsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  // Récupérer tous les utilisateurs (référents et admins)
  const users = await prisma.user.findMany({
    where: {
      OR: [{ role: 'ADMIN' }, { role: 'REFERENT' }],
    },
    orderBy: { email: 'asc' },
    select: {
      id: true,
      email: true,
      role: true,
      avatar: true,
    },
  });

  // Liste des avatars disponibles
  const availableAvatars = [
    '/avatars/Akim.png',
    '/avatars/Kevin.png',
    '/avatars/Manu.png',
    '/avatars/Sabir.png',
    '/avatars/johan.png',
    '/avatars/olivier.png',
  ];

  return (
    <>
      <Navbar userEmail={session.user.email} userRole={session.user.role} userAvatar={session.user.avatar} />

      <div className="container py-4">
        <div className="mb-4">
          <h1 className="h2 mb-1">
            <i className="bi bi-person-bounding-box me-2"></i>
            Gestion des avatars
          </h1>
          <p className="text-muted mb-0">
            Associez les photos aux référents et administrateurs
          </p>
        </div>

        <AvatarAssignment users={users} availableAvatars={availableAvatars} />
      </div>
    </>
  );
}
