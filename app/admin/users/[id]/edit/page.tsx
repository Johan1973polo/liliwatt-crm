import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import AdminEditForm from './AdminEditForm';

export default async function AdminEditPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  const adminId = params.id;

  // Récupérer l'admin à modifier
  const admin = await prisma.user.findUnique({
    where: { id: adminId },
    select: {
      id: true,
      email: true,
      phone: true,
      specialty: true,
      isActive: true,
      role: true,
      avatar: true,
      createdAt: true,
    },
  });

  // Liste des avatars disponibles
  const availableAvatars = [
    '/avatars/Akim.png',
    '/avatars/Kevin.png',
    '/avatars/Manu.png',
    '/avatars/Sabir.png',
    '/avatars/johan.png',
    '/avatars/olivier.png',
  ];

  if (!admin || admin.role !== 'ADMIN') {
    redirect('/admin/users');
  }

  return (
    <>
      <Navbar
        userEmail={session.user.email}
        userRole={session.user.role}
        userAvatar={session.user.avatar}
      />

      <div className="container py-4">
        <div className="mb-4">
          <h1 className="h2 mb-1">
            <i className="bi bi-pencil-square me-2"></i>
            Modifier l&apos;administrateur
          </h1>
          <p className="text-muted mb-0">{admin.email}</p>
        </div>

        <AdminEditForm admin={admin} availableAvatars={availableAvatars} />
      </div>
    </>
  );
}
