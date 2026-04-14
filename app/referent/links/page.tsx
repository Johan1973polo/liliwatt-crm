import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import TeamLinksManager from './TeamLinksManager';

export default async function ReferentLinksPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'REFERENT') {
    redirect('/auth/signin');
  }

  // Récupérer les liens d'équipe du référent
  const teamLinks = await prisma.link.findMany({
    where: {
      scope: 'TEAM',
      teamReferentId: session.user.id,
    },
    orderBy: { order: 'asc' },
  });

  // Récupérer les notifications non lues (SAUF performances)
  const unreadCount = await prisma.notification.count({
    where: {
      userId: session.user.id,
      isRead: false,
      kind: 'MESSAGE',
    },
  });

  // Compter les notifications de performances non lues
  const performancesActivityCount = await prisma.notification.count({
    where: {
      userId: session.user.id,
      kind: { in: ['SALE_MADE', 'INVOICE_RECEIVED'] },
      isRead: false,
    },
  });

  return (
    <>
      <Navbar
        userEmail={session.user.email}
        userRole={session.user.role} userAvatar={session.user.avatar}
        notificationCount={unreadCount}
        performancesActivityCount={performancesActivityCount}
      />

      <div className="container py-4">
        <div className="mb-4">
          <h1 className="h2 mb-1">
            <i className="bi bi-link-45deg me-2"></i>
            Liens d&apos;Équipe
          </h1>
          <p className="text-muted mb-0">
            Gérer les liens visibles par tous vos vendeurs
          </p>
        </div>

        <TeamLinksManager initialLinks={teamLinks} />
      </div>
    </>
  );
}
