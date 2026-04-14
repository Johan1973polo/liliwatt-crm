import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import VendorEditForm from './VendorEditForm';

export default async function VendorEditPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { view?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !==)) {
    redirect('/auth/signin');
  }

  const vendorId = params.id;
  const isViewMode = searchParams.view === 'true';

  // Récupérer le vendeur avec ses identifiants et liens
  const vendor = await prisma.user.findUnique({
    where: { id: vendorId },
    include: {
      credentials: {
        orderBy: { createdAt: 'desc' },
      },
      personalLinks: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!vendor || vendor.role !== 'VENDEUR') {
    redirect('/admin');
  }

  return (
    <>
      <Navbar userEmail={session.user.email} userRole={session.user.role} userAvatar={session.user.avatar} />

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
          backUrl="/admin"
        />
      </div>
    </>
  );
}
