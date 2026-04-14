import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import CreateAdminForm from './CreateAdminForm';
import AdminsList from './AdminsList';

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  // Récupérer tous les admins
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      phone: true,
      specialty: true,
      isActive: true,
      createdAt: true,
    },
  });

  return (
    <>
      <Navbar userEmail={session.user.email} userRole={session.user.role} userAvatar={session.user.avatar} />

      <div className="container py-4">
        <div className="mb-4">
          <h1 className="h2 mb-1">
            <i className="bi bi-person-gear me-2"></i>
            Gestion des administrateurs
          </h1>
          <p className="text-muted mb-0">
            Créez et gérez les comptes administrateurs
          </p>
        </div>

        <div className="row">
          {/* Formulaire de création */}
          <div className="col-md-6 mb-4">
            <CreateAdminForm />
          </div>

          {/* Liste des admins */}
          <div className="col-md-6">
            <AdminsList admins={admins} currentUserId={session.user.id} />
          </div>
        </div>
      </div>
    </>
  );
}
