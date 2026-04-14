import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import ReferentMessagesInterface from './ReferentMessagesInterface';

export default async function ReferentMessagesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'REFERENT') {
    redirect('/auth/signin');
  }

  const userId = session.user.id;

  // Récupérer tous les admins
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, email: true, phone: true, avatar: true, specialty: true },
    orderBy: { createdAt: 'desc' },
  });

  // Récupérer tous les référents (sauf l'utilisateur actuel)
  const referents = await prisma.user.findMany({
    where: {
      role: 'REFERENT',
      id: { not: userId },
    },
    select: { id: true, email: true, phone: true, avatar: true },
    orderBy: { createdAt: 'desc' },
  });

  // Récupérer tous les utilisateurs Back-Office
  const backoffice = await prisma.user.findMany({
    where: { role: },
    select: { id: true, email: true, phone: true, avatar: true },
    orderBy: { createdAt: 'desc' },
  });

  // Récupérer UNIQUEMENT les vendeurs du référent connecté (cloisonnement)
  const vendeurs = await prisma.user.findMany({
    where: {
      role: 'VENDEUR',
      referentId: userId, // CRITIQUE: Ne montrer que SES vendeurs
    },
    select: { id: true, email: true, phone: true, avatar: true },
    orderBy: { createdAt: 'desc' },
  });

  // Compter les messages non lus par vendeur
  const unreadCountsByVendeur = await Promise.all(
    vendeurs.map(async (vendeur) => {
      const count = await prisma.message.count({
        where: {
          toUserId: userId,
          fromUserId: vendeur.id,
          readAt: null,
        },
      });
      return { userId: vendeur.id, count };
    })
  );

  // Compter les messages non lus par admin
  const unreadCountsByAdmin = await Promise.all(
    admins.map(async (admin) => {
      const count = await prisma.message.count({
        where: {
          toUserId: userId,
          fromUserId: admin.id,
          readAt: null,
        },
      });
      return { userId: admin.id, count };
    })
  );

  // Compter les messages non lus par référent
  const unreadCountsByReferent = await Promise.all(
    referents.map(async (referent) => {
      const count = await prisma.message.count({
        where: {
          toUserId: userId,
          fromUserId: referent.id,
          readAt: null,
        },
      });
      return { userId: referent.id, count };
    })
  );

  // Compter les messages non lus par back-office
  const unreadCountsByBackoffice = await Promise.all(
    backoffice.map(async (bo) => {
      const count = await prisma.message.count({
        where: {
          toUserId: userId,
          fromUserId: bo.id,
          readAt: null,
        },
      });
      return { userId: bo.id, count };
    })
  );

  // Compter UNIQUEMENT les notifications de messages non lues
  const totalUnreadNotifications = await prisma.notification.count({
    where: {
      userId: userId,
      isRead: false,
      kind: 'MESSAGE',
    },
  });

  // Compter les notifications de performances non lues
  const performancesActivityCount = await prisma.notification.count({
    where: {
      userId: userId,
      kind: { in: ['SALE_MADE', 'INVOICE_RECEIVED'] },
      isRead: false,
    },
  });

  // NOTE: Le marquage des notifications MESSAGE comme lues se fait dans l'API GET /api/messages
  // quand le composant client charge les messages de la conversation

  return (
    <>
      <Navbar
        userEmail={session.user.email}
        userRole={session.user.role}
        userAvatar={session.user.avatar}
        notificationCount={totalUnreadNotifications}
        performancesActivityCount={performancesActivityCount}
      />

      <div className="container py-4">
        <div className="mb-4">
          <h1 className="h2 mb-1">
            <i className="bi bi-chat-dots me-2"></i>
            Messagerie
          </h1>
          <p className="text-muted mb-0">
            Communiquez avec les admins, les référents et les vendeurs
          </p>
        </div>

        <ReferentMessagesInterface
          currentUserId={userId}
          currentUserRole="REFERENT"
          admins={admins}
          referents={referents}
          backoffice={backoffice}
          vendeurs={vendeurs}
          unreadCountsByVendeur={unreadCountsByVendeur}
          unreadCountsByAdmin={unreadCountsByAdmin}
          unreadCountsByReferent={unreadCountsByReferent}
          unreadCountsByBackoffice={unreadCountsByBackoffice}
        />
      </div>
    </>
  );
}
