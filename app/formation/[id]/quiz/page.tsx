import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import { prisma } from '@/lib/prisma';
import QuizClient from './QuizClient';

export const revalidate = 0;

export default async function QuizPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const moduleId = params.id;

  // Vérifier que le module existe
  const mod = await prisma.trainingModule.findUnique({
    where: { id: moduleId },
    select: { id: true, title: true, order: true, icon: true },
  });

  if (!mod) {
    redirect('/formation');
  }

  // Notifications pour navbar
  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, isRead: false, kind: 'MESSAGE' },
  });

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
        notificationCount={unreadCount}
        performancesActivityCount={performancesActivityCount}
      />
      <div className="container py-4" style={{ maxWidth: '800px' }}>
        <QuizClient moduleId={moduleId} />
      </div>
    </>
  );
}
