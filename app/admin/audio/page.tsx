import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import AudioManager from './AudioManager';

export const revalidate = 0;

export default async function AdminAudioPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, isRead: false, kind: 'MESSAGE' },
  });
  const performancesActivityCount = await prisma.notification.count({
    where: { userId: session.user.id, kind: { in: ['SALE_MADE', 'INVOICE_RECEIVED'] }, isRead: false },
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
      <div className="container-fluid py-4">
        <div className="mb-4">
          <h1 className="h2 mb-1">
            <i className="bi bi-mic me-2"></i>
            Débriefing &amp; Bonnes pratiques
          </h1>
          <p className="text-muted mb-0">Ajoutez des audios pédagogiques pour vos équipes</p>
        </div>
        <AudioManager />
      </div>
    </>
  );
}
