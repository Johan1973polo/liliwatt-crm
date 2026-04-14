import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import ChallengeManager from './ChallengeManager';

export default async function AdminChallengePage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  // Récupérer le challenge actif
  const activeChallenge = await prisma.challenge.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <Navbar userEmail={session.user.email} userRole={session.user.role} userAvatar={session.user.avatar} />

      <div className="container py-4">
        <div className="mb-4">
          <h1 className="h2 mb-1">
            <i className="bi bi-trophy me-2"></i>
            Gestion du Challenge
          </h1>
          <p className="text-muted mb-0">
            Créez et gérez le challenge du jour pour motiver vos vendeurs
          </p>
        </div>

        <ChallengeManager activeChallenge={activeChallenge} />
      </div>
    </>
  );
}
