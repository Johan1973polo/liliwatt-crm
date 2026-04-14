import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import VendorEditForm from '@/app/admin/vendors/[id]/edit/VendorEditForm';

export default async function ReferentVendorEditPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { view?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'REFERENT') {
    redirect('/auth/signin');
  }

  const vendorId = params.id;
  const isViewMode = searchParams.view === 'true';

  // Récupérer le vendeur et vérifier qu'il appartient bien au référent
  const vendor = await prisma.user.findUnique({
    where: {
      id: vendorId,
      role: 'VENDEUR',
      referentId: session.user.id,
    },
    include: {
      credentials: {
        orderBy: { createdAt: 'desc' },
      },
      personalLinks: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!vendor) {
    redirect('/referent');
  }

  // Récupérer les notifications non lues (SAUF performances)
  const unreadCount = await prisma.notification.count({
    where: {
      userId: session.user.id,
      isRead: false,
      kind: 'MESSAGE',
    },
  });

  // Compter les notifications de performances non lues
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

      <div className="container py-4">
        <div className="mb-4">
          <h1 className="h2 mb-1">
            <i className="bi bi-person-circle me-2"></i>
            {isViewMode ? 'Consulter' : 'Éditer'} le vendeur
          </h1>
          <p className="text-muted mb-0">{vendor.email}</p>
        </div>

        <VendorEditForm
          vendor={vendor}
          isViewMode={isViewMode}
          backUrl="/referent"
          hideLinks={false}
        />
      </div>
    </>
  );
}
