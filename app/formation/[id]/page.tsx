import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import ModuleContent from './ModuleContent';
import Link from 'next/link';

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

  // SÉCURITÉ: Si VENDEUR/REFERENT et module LOCKED, rediriger
  if (['VENDEUR', 'REFERENT'].includes(session.user.role) && (!progress || progress.status === 'LOCKED')) {
    redirect('/formation?error=locked');
  }

  // Si le statut est UNLOCKED, passer automatiquement à IN_PROGRESS
  if (['VENDEUR', 'REFERENT'].includes(session.user.role) && progress && progress.status === 'UNLOCKED') {
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

        {/* Bouton Quiz */}
        <div className="text-center mt-4 mb-5" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Link
            href={`/formation/${moduleId}/quiz`}
            className="btn text-white py-3 px-5 w-100"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #d946ef)',
              border: 'none',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: 700,
            }}
          >
            <i className="bi bi-mortarboard me-2"></i>
            Passer le quiz de validation
          </Link>
        </div>
      </div>
    </>
  );
}
