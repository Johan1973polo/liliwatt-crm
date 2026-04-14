import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import GlobalLinksManager from './GlobalLinksManager';

export default async function AdminLinksPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !==)) {
    redirect('/auth/signin');
  }

  // Récupérer tous les liens globaux (tous types: pour tous, référents, vendeurs)
  const globalLinks = await prisma.link.findMany({
    where: {
      scope: {
        in: ['GLOBAL', 'GLOBAL_REFERENT', 'GLOBAL_VENDOR']
      }
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
            Liens Globaux
          </h1>
          <p className="text-muted mb-0">
            Gérer les liens visibles par tous les utilisateurs
          </p>
        </div>

        <GlobalLinksManager initialLinks={globalLinks} />
      </div>
    </>
  );
}
