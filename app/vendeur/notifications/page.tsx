import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import NotificationsList from '@/app/admin/notifications/NotificationsList';

export default async function VendeurNotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !['VENDEUR', 'REFERENT'].includes(session.user.role)) {
    redirect('/auth/signin');
  }

  // Récupérer toutes les notifications du vendeur
  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  // Récupérer les demandes et messages associés
  const requestIds = notifications
    .filter((n) => n.kind === 'REQUEST')
    .map((n) => n.entityId);
  const messageIds = notifications
    .filter((n) => n.kind === 'MESSAGE')
    .map((n) => n.entityId);

  const requests = await prisma.request.findMany({
    where: { id: { in: requestIds } },
    include: {
      user: { select: { email: true } },
      referent: { select: { email: true } },
    },
  });

  const messages = await prisma.message.findMany({
    where: { id: { in: messageIds } },
    include: {
      from: { select: { email: true } },
      to: { select: { email: true } },
    },
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <Navbar
        userEmail={session.user.email}
        userRole={session.user.role} userAvatar={session.user.avatar}
        notificationCount={unreadCount}
      />

      <div className="container py-4">
        <div className="mb-4">
          <h1 className="h2 mb-1">
            <i className="bi bi-bell me-2"></i>
            Notifications
          </h1>
          <p className="text-muted mb-0">
            {unreadCount > 0
              ? `${unreadCount} notification(s) non lue(s)`
              : 'Toutes les notifications sont lues'}
          </p>
        </div>

        <NotificationsList
          notifications={notifications}
          requests={requests}
          messages={messages}
        />
      </div>
    </>
  );
}
