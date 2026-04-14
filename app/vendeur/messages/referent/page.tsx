import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import MessagingInterface from './MessagingInterface';

export default async function VendeurReferentMessagesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'VENDEUR') {
    redirect('/auth/signin');
  }

  const userId = session.user.id;
  const referentId = session.user.referentId;

  // Récupérer le référent
  const referents = referentId ? await prisma.user.findMany({
    where: { id: referentId },
    select: { id: true, email: true, phone: true, avatar: true },
  }) : [];

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
            <i className="bi bi-chat-right-text me-2"></i>
            Messages de votre Référent
          </h1>
          <p className="text-muted mb-0">
            Communiquez avec votre référent
          </p>
        </div>

        <MessagingInterface
          currentUserId={userId}
          referents={referents}
          category="REFERENT"
        />
      </div>
    </>
  );
}
