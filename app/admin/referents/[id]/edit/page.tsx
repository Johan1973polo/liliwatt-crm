import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import ReferentEditForm from './ReferentEditForm';

export default async function ReferentEditPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !==)) {
    redirect('/auth/signin');
  }

  const referentId = params.id;

  // Récupérer le référent avec ses identifiants et liens
  const referent = await prisma.user.findUnique({
    where: { id: referentId },
    include: {
      credentials: {
        orderBy: { createdAt: 'desc' },
      },
      personalLinks: {
        orderBy: { order: 'asc' },
      },
      _count: {
        select: {
          vendeurs: true,
        },
      },
    },
  });

  if (!referent || referent.role !== 'REFERENT') {
    redirect('/admin/referents');
  }

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
            <i className="bi bi-person-badge me-2"></i>
            Éditer le référent
          </h1>
          <p className="text-muted mb-0">{referent.email}</p>
        </div>

        <ReferentEditForm referent={referent} availableAvatars={availableAvatars} />
      </div>
    </>
  );
}
