import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import ExchangesViewer from './ExchangesViewer';

export default async function AdminExchangesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  // Récupérer tous les utilisateurs par rôle
  const referents = await prisma.user.findMany({
    where: { role: 'REFERENT' },
    select: { id: true, email: true, avatar: true, phone: true },
    orderBy: { email: 'asc' },
  });

  const vendeurs = await prisma.user.findMany({
    where: { role: 'VENDEUR' },
    select: { id: true, email: true, avatar: true, referentId: true },
    orderBy: { email: 'asc' },
  });

  const backofficeUsers = await prisma.user.findMany({
    where: { role: },
    select: { id: true, email: true, avatar: true, phone: true },
    orderBy: { email: 'asc' },
  });

  // Compter les notifications non lues (SAUF performances)
  const notificationCount = await prisma.notification.count({
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
        userRole={session.user.role}
        userAvatar={session.user.avatar}
        notificationCount={notificationCount}
        performancesActivityCount={performancesActivityCount}
      />

      <div className="container-fluid py-4">
        <div className="mb-4">
          <h1 className="h2 mb-1">
            <i className="bi bi-eye me-2"></i>
            Consultation des Échanges
          </h1>
          <p className="text-muted mb-0">
            Visualisation en lecture seule des conversations entre utilisateurs
          </p>
        </div>

        <ExchangesViewer
          referents={referents}
          vendeurs={vendeurs}
          backofficeUsers={backofficeUsers}
        />
      </div>
    </>
  );
}
