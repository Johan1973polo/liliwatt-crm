import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import MessagingInterface from './MessagingInterface';

export default async function VendeurDirectionMessagesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'VENDEUR') {
    redirect('/auth/signin');
  }

  const userId = session.user.id;

  // Récupérer tous les admins
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, email: true, avatar: true, specialty: true },
    orderBy: { email: 'asc' },
  });

  // Compter les messages non lus par admin
  const unreadCountsByAdmin = await Promise.all(
    admins.map(async (admin) => {
      const count = await prisma.message.count({
        where: {
          toUserId: userId,
          fromUserId: admin.id,
          category: 'DIRECTION',
          readAt: null,
        },
      });
      return { adminId: admin.id, count };
    })
  );

  // Compter les messages non lus pour chaque catégorie
  const directionCount = await prisma.message.count({
    where: {
      toUserId: userId,
      category: 'DIRECTION',
      readAt: null,
    },
  });

  const referentCount = await prisma.message.count({
    where: {
      toUserId: userId,
      category: 'REFERENT',
      readAt: null,
    },
  });

  const backofficeCount = await prisma.message.count({
    where: {
      toUserId: userId,
      category: 'BACKOFFICE',
      readAt: null,
    },
  });

  const notificationCount = await prisma.notification.count({
    where: {
      userId,
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
        directionMessageCount={directionCount}
        referentMessageCount={referentCount}
      />

      <div className="container py-4">
        <div className="mb-4">
          <h1 className="h2 mb-1">
            <i className="bi bi-chat-left-text me-2"></i>
            Messages de la Direction
          </h1>
          <p className="text-muted mb-0">
            Communiquez avec les administrateurs et la direction
          </p>
        </div>

        <MessagingInterface
          currentUserId={userId}
          admins={admins}
          category="DIRECTION"
          unreadCountsByUser={unreadCountsByAdmin}
        />
      </div>
    </>
  );
}
