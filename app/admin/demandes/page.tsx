import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import AdminDemandesTable from './AdminDemandesTable';

export const revalidate = 0;

export default async function AdminDemandesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  // Récupérer toutes les demandes
  const requests = await prisma.request.findMany({
    include: {
      user: {
        select: { email: true },
      },
      vendor: {
        select: { email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <Navbar
        userEmail={session.user.email}
        userRole={session.user.role}
        userAvatar={session.user.avatar}
      />

      <div className="container-fluid py-4">
        <div className="mb-4">
          <h1 className="h2 mb-1">
            <i className="bi bi-clipboard2-check me-2"></i>
            Gestion des Demandes
          </h1>
          <p className="text-muted mb-0">
            Console d&apos;administration des demandes (base, factures, intégrations)
          </p>
        </div>

        <AdminDemandesTable requests={requests} />
      </div>
    </>
  );
}
