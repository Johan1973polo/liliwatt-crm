import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import AdminMessagesInterface from './AdminMessagesInterface';

export default async function AdminMessagesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  const userId = session.user.id;

  // Récupérer tous les référents
  const referents = await prisma.user.findMany({
    where: { role: 'REFERENT' },
    select: { id: true, email: true, phone: true, avatar: true },
    orderBy: { email: 'asc' },
  });

  // Récupérer tous les vendeurs
  const vendeurs = await prisma.user.findMany({
    where: { role: 'VENDEUR' },
    select: { id: true, email: true, phone: true, avatar: true },
    orderBy: { email: 'asc' },
  });

  // Compter les notifications non lues (SAUF performances)
  const notificationCount = await prisma.notification.count({
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
        notificationCount={notificationCount}
        performancesActivityCount={performancesActivityCount}
      />

      <div className="container py-4">
        <div className="mb-4">
          <h1 className="h2 mb-1">
            <i className="bi bi-chat-dots me-2"></i>
            Messagerie
          </h1>
          <p className="text-muted mb-0">
            Communiquez avec les référents et les vendeurs
          </p>
        </div>

        <AdminMessagesInterface
          currentUserId={userId}
          currentUserRole={session.user.role}
          referents={referents}
          vendeurs={vendeurs}
        />
      </div>
    </>
  );
}
