import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import TrainingManagement from './TrainingManagement';

export const revalidate = 0;

export default async function FormationGestionPage() {
  const session = await getServerSession(authOptions);

  if (!session || !['ADMIN', 'REFERENT'].includes(session.user.role)) {
    redirect('/auth/signin');
  }

  // Récupérer tous les modules
  const modules = await prisma.trainingModule.findMany({
    orderBy: { order: 'asc' },
  });

  // Récupérer tous les vendeurs selon le rôle
  let sellers;
  if (session.user.role === 'ADMIN') {
    // Admin voit tous les vendeurs
    sellers = await prisma.user.findMany({
      where: { role: 'VENDEUR' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        courtierNumber: true,
        createdAt: true,
        trainingProgress: {
          include: {
            module: true,
            unlocker: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { firstName: 'asc' },
    });
  } else {
    // Référent voit uniquement ses vendeurs
    sellers = await prisma.user.findMany({
      where: {
        role: 'VENDEUR',
        referentId: session.user.id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        courtierNumber: true,
        createdAt: true,
        trainingProgress: {
          include: {
            module: true,
            unlocker: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { firstName: 'asc' },
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
        <div className="mb-4">
          <h1 className="h2 mb-1">
            <i className="bi bi-gear me-2"></i>
            Gestion de la Formation
          </h1>
          <p className="text-muted mb-0">
            Déverrouillez et gérez la progression de vos vendeurs
          </p>
        </div>

        <TrainingManagement
          modules={modules}
          sellers={sellers}
          userRole={session.user.role}
        />
      </div>
    </>
  );
}
