import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import MessagesInterface from './MessagesInterface';

export default async function VendeurMessagesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'VENDEUR') {
    redirect('/auth/signin');
  }

  const userId = session.user.id;
  const referentId = session.user.referentId;

  // Récupérer le référent
  const referent = referentId
    ? await prisma.user.findUnique({
        where: { id: referentId },
        select: { id: true, email: true, phone: true, avatar: true },
      })
    : null;

  // Récupérer tous les messages (envoyés + reçus) avec le référent
  const messages = referentId
    ? await prisma.message.findMany({
        where: {
          OR: [
            { fromUserId: userId, toUserId: referentId },
            { fromUserId: referentId, toUserId: userId },
          ],
        },
        orderBy: { createdAt: 'asc' },
        include: {
          from: { select: { email: true, role: true, avatar: true } },
          to: { select: { email: true, role: true, avatar: true } },
        },
      })
    : [];

  return (
    <>
      <Navbar userEmail={session.user.email} userRole={session.user.role} userAvatar={session.user.avatar} />

      <div className="container py-4">
        <div className="mb-4">
          <h1 className="h2 mb-1">
            <i className="bi bi-chat-dots me-2"></i>
            Messagerie
          </h1>
          <p className="text-muted mb-0">
            {referent
              ? `Discussion avec votre référent : ${referent.email}`
              : 'Aucun référent assigné'}
          </p>
        </div>

        <MessagesInterface
          currentUserId={userId}
          currentUserRole={session.user.role}
          referent={referent}
          initialMessages={messages}
        />
      </div>
    </>
  );
}
