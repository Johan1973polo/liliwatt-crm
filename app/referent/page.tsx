import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import VendeursTableau from './VendeursTableau';
import VendeurIdentifiants from '../vendeur/VendeurIdentifiants';
import LinksBlock from '../vendeur/LinksBlock';
import QuickAccessCards from '../vendeur/QuickAccessCards';
import MarchesEnergie from '@/components/MarchesEnergie';
import AutoRefresh from '@/components/AutoRefresh';

export const revalidate = 0;

export default async function ReferentPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'REFERENT') {
    redirect('/auth/signin');
  }

  const userId = session.user.id;

  // Récupérer les liens personnels du référent
  const personalLinks = await prisma.link.findMany({
    where: {
      scope: 'USER',
      userId,
    },
    orderBy: { order: 'asc' },
  });

  // Récupérer les vendeurs du référent
  const vendeurs = await prisma.user.findMany({
    where: {
      role: 'VENDEUR',
      referentId: session.user.id,
    },
    select: {
      id: true,
      email: true,
      phone: true,
      createdAt: true,
      isActive: true,
      courtierNumber: true,
      avatar: true,
    },
    orderBy: { createdAt: 'desc' },
  });

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
      <AutoRefresh interval={10000} />
      <Navbar
        userEmail={session.user.email}
        userRole={session.user.role} userAvatar={session.user.avatar}
        notificationCount={unreadCount}
        performancesActivityCount={performancesActivityCount}
      />

      <div className="container-fluid py-4">
        {/* Accès rapides */}
        <QuickAccessCards />

        <MarchesEnergie />

        {/* Section Liens et Identifiants */}
        <div className="row mb-4">
          <div className="col-md-6">
            <LinksBlock links={personalLinks} />
          </div>
          <div className="col-md-6">
            <VendeurIdentifiants />
          </div>
        </div>

        <div className="mb-4">
          <h1 className="h2 mb-0">
            <i className="bi bi-people-fill me-2"></i>
            Mes Vendeurs
          </h1>
        </div>

        {vendeurs.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-5">
              <i className="bi bi-inbox display-1 text-muted"></i>
              <p className="text-muted mt-3 mb-0">
                Aucun vendeur dans votre équipe. Créez-en un pour commencer.
              </p>
            </div>
          </div>
        ) : (
          <VendeursTableau vendeurs={vendeurs} />
        )}
      </div>
    </>
  );
}
