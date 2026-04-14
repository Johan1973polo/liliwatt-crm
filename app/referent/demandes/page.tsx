import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import ReferentDemandesForm from './ReferentDemandesForm';

export default async function ReferentDemandesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'REFERENT') {
    redirect('/auth/signin');
  }

  const userId = session.user.id;

  // Récupérer les vendeurs du référent
  const vendors = await prisma.user.findMany({
    where: {
      role: 'VENDEUR',
      referentId: userId,
    },
    select: {
      id: true,
      email: true,
    },
    orderBy: { email: 'asc' },
  });

  // Récupérer les notifications non lues (SAUF performances)
  const unreadCount = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
      kind: 'MESSAGE',
    },
  });

  // Compter les notifications de performances non lues
  const performancesActivityCount = await prisma.notification.count({
    where: {
      userId,
      kind: { in: ['SALE_MADE', 'INVOICE_RECEIVED'] },
      isRead: false,
    },
  });

  return (
    <>
      <Navbar
        userEmail={session.user.email}
        userRole={session.user.role}
        userAvatar={session.user.avatar}
        notificationCount={unreadCount}
        performancesActivityCount={performancesActivityCount}
      />

      <div className="container py-4">
        <div className="mb-4">
          <h1 className="h2 mb-1">
            <i className="bi bi-clipboard-check me-2"></i>
            Mes Demandes
          </h1>
          <p className="text-muted mb-0">
            Envoyez vos demandes à l&apos;administration (base de données, factures, intégrations)
          </p>
        </div>

        <div className="row">
          <div className="col-lg-8 mx-auto">
            <ReferentDemandesForm referentId={userId} vendors={vendors} />
          </div>
        </div>
      </div>
    </>
  );
}
