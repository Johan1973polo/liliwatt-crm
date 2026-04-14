import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import ModuleContent from './ModuleContent';

export const revalidate = 0;

export default async function ModuleDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  const moduleId = params.id;

  // Récupérer le module
  const trainingModule = await prisma.trainingModule.findUnique({
    where: { id: moduleId },
  });

  if (!trainingModule) {
    redirect('/formation');
  }

  // Récupérer la progression
  const progress = await prisma.trainingProgress.findUnique({
    where: {
      sellerId_moduleId: {
        sellerId: session.user.id,
        moduleId: moduleId,
      },
    },
    include: {
      unlocker: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  // SÉCURITÉ: Si VENDEUR et module LOCKED, rediriger
  if (session.user.role === 'VENDEUR' && (!progress || progress.status === 'LOCKED')) {
    redirect('/formation?error=locked');
  }

  // Si le statut est UNLOCKED et que c'est un VENDEUR, passer automatiquement à IN_PROGRESS
  if (session.user.role === 'VENDEUR' && progress && progress.status === 'UNLOCKED') {
    await prisma.trainingProgress.update({
      where: { id: progress.id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });
  }

  // Compter les notifications
  const notificationCount = await prisma.notification.count({
    where: {
      userId: session.user.id,
      isRead: false,
      kind: 'MESSAGE',
    },
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
        notificationCount={notificationCount}
        performancesActivityCount={performancesActivityCount}
      />

      <div className="container-fluid py-4">
        <ModuleContent
          module={trainingModule}
          progress={progress}
          isAdmin={['ADMIN', 'REFERENT'].includes(session.user.role)}
        />
      </div>
    </>
  );
}
