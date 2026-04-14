import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import PerformancesFeed from './PerformancesFeed';
import { prisma } from '@/lib/prisma';

export const revalidate = 0;

export default async function PerformancesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  // Récupérer le nombre de notifications non lues
  let notificationCount = 0;
  let directionCount = 0;
  let referentCount = 0;
  let backofficeCount = 0;

  if (session.user.role === 'VENDEUR') {
    notificationCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    });

    directionCount = await prisma.message.count({
      where: {
        toUserId: session.user.id,
        category: 'DIRECTION',
        readAt: null,
      },
    });

    referentCount = await prisma.message.count({
      where: {
        toUserId: session.user.id,
        category: 'REFERENT',
        readAt: null,
      },
    });

    backofficeCount = await prisma.message.count({
      where: {
        toUserId: session.user.id,
        category: 'BACKOFFICE',
        readAt: null,
      },
    });
  } else {
    // Pour les autres rôles (ADMIN, REFERENT, ) : compter uniquement les messages
    notificationCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
        kind: 'MESSAGE',
      },
    });
  }

  // Compter les notifications de performances non lues AVANT de les marquer comme lues
  const performancesActivityCount = await prisma.notification.count({
    where: {
      userId: session.user.id,
      kind: { in: ['SALE_MADE', 'INVOICE_RECEIVED'] },
      isRead: false,
    },
  });

  // Marquer les notifications de performances comme lues (APRÈS avoir compté)
  await prisma.notification.updateMany({
    where: {
      userId: session.user.id,
      kind: { in: ['SALE_MADE', 'INVOICE_RECEIVED'] },
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  // Récupérer le numéro de courtier de l'utilisateur
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { courtierNumber: true },
  });

  return (
    <>
      <Navbar
        userEmail={session.user.email}
        userRole={session.user.role}
        userAvatar={session.user.avatar}
        notificationCount={notificationCount}
        directionMessageCount={directionCount}
        referentMessageCount={referentCount}
        backofficeMessageCount={backofficeCount}
        performancesActivityCount={performancesActivityCount}
      />

      <div className="container-fluid py-4">
        <div className="mb-4">
          <h1 className="h2 mb-1">
            <i className="bi bi-trophy me-2"></i>
            Performances de l&apos;entreprise
          </h1>
          <p className="text-muted mb-0">
            Suivez en direct les succès de toute l&apos;équipe
          </p>
        </div>

        <div className="row">
          <div className="col-lg-10 col-xl-8 mx-auto">
            <PerformancesFeed />

            <div className="alert alert-info mt-4 mb-0">
              <i className="bi bi-info-circle me-2"></i>
              <strong>Info :</strong> Les performances sont affichées avec les prénoms pour préserver l&apos;anonymat.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
