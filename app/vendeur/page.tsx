import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import AutoRefresh from '@/components/AutoRefresh';
import ChallengeAlert from './ChallengeAlert';
import MessageBlock from './MessageBlock';
import DemandesBlock from './DemandesBlock';
import TeamActivityFeed from './TeamActivityFeed';
import QuickAccessCards from './QuickAccessCards';
import VendeurIdentifiants from './VendeurIdentifiants';
import DeclarationButtons from './DeclarationButtons';
import TeamOnlineStatus from './TeamOnlineStatus';
import LinksBlock from './LinksBlock';
import MarchesEnergie from '@/components/MarchesEnergie';

// Désactiver le cache pour cette page
export const revalidate = 0;

export default async function VendeurPage() {
  const session = await getServerSession(authOptions);

  if (!session || !['VENDEUR', 'REFERENT'].includes(session.user.role)) {
    redirect('/auth/signin');
  }

  const userId = session.user.id;
  const referentId = session.user.referentId;

  // Récupérer le référent avec téléphone
  const referent = referentId
    ? await prisma.user.findUnique({
        where: { id: referentId },
        select: { id: true, email: true, phone: true },
      })
    : null;

  // Récupérer le nombre de notifications non lues
  const notificationCount = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });

  // Compter les messages non lus pour chaque catégorie
  const directionCount = await prisma.message.count({
    where: {
      toUserId: userId,
      category: 'DIRECTION',
      readAt: null,
    },
  });

  const referentCount = await prisma.message.count({
    where: {
      toUserId: userId,
      category: 'REFERENT',
      readAt: null,
    },
  });

  // Récupérer le challenge actif
  const activeChallenge = await prisma.challenge.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    select: { message: true },
  });

  // Récupérer le numéro de courtier
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { courtierNumber: true, firstName: true, lastName: true },
  });

  // Compter les notifications de performances non lues
  const performancesActivityCount = await prisma.notification.count({
    where: {
      userId,
      kind: { in: ['SALE_MADE', 'INVOICE_RECEIVED'] },
      isRead: false,
    },
  });

  return (
    <>
      <AutoRefresh interval={10000} />
      <Navbar
        userEmail={session.user.email}
        userRole={session.user.role}
        userAvatar={session.user.avatar}
        notificationCount={notificationCount}
        directionMessageCount={directionCount}
        referentMessageCount={referentCount}
        performancesActivityCount={performancesActivityCount}
      />

      <div className="container-fluid py-4">
        <div className="mb-4 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h2 mb-1">
              <i className="bi bi-house-door me-2"></i>
              Mon Espace
            </h1>
            <p className="text-muted mb-0">Bienvenue sur votre tableau de bord</p>
            {currentUser?.courtierNumber && (
              <div className="mt-2">
                <span className="badge bg-primary" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                  <i className="bi bi-person-badge me-2"></i>
                  Vous êtes le courtier n°{currentUser.courtierNumber}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Challenge du jour */}
        <ChallengeAlert challenge={activeChallenge} />

        {/* Accès rapides */}
        <QuickAccessCards />

        {/* Marchés Énergie */}
        <MarchesEnergie />

        {/* Annonces à l'équipe */}
        <DeclarationButtons />

        {/* Fil d'activité de l'équipe */}
        <TeamActivityFeed />

        <div className="row g-4">
          {/* Colonne de gauche */}
          <div className="col-lg-6">
            <VendeurIdentifiants />
            <LinksBlock />
          </div>

          {/* Colonne de droite */}
          <div className="col-lg-6">
            <TeamOnlineStatus />
            <MessageBlock referent={referent} />
            <DemandesBlock userRole={session.user.role} userEmail={session.user.email} userPrenom={currentUser?.firstName || ''} userNom={currentUser?.lastName || ''} />
          </div>
        </div>
      </div>
    </>
  );
}
