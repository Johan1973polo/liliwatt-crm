import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import NewVendorForm from './NewVendorForm';

export default async function NewVendorPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'ADMIN')) {
    redirect('/auth/signin');
  }

  // Récupérer tous les référents pour le champ de sélection
  const referents = await prisma.user.findMany({
    where: { role: 'REFERENT' },
    select: {
      id: true,
      email: true,
    },
    orderBy: { email: 'asc' },
  });

  return (
    <>
      <Navbar userEmail={session.user.email} userRole={session.user.role} userAvatar={session.user.avatar} />

      <div className="container py-4">
        <div className="mb-4">
          <h1 className="h2 mb-1">
            <i className="bi bi-person-plus me-2"></i>
            Nouveau vendeur
          </h1>
          <p className="text-muted mb-0">Créer un nouveau compte vendeur</p>
        </div>

        <NewVendorForm referents={referents} />
      </div>
    </>
  );
}
