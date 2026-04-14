import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import VendeursTableau from './VendeursTableau';
import CredentialsBlock from '../vendeur/CredentialsBlock';
import LinksBlock from '../vendeur/LinksBlock';
import AutoRefresh from '@/components/AutoRefresh';

export const revalidate = 0;

export default async function ReferentPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'REFERENT') {
    redirect('/auth/signin');
  }

  const userId = session.user.id;

  // Récupérer les identifiants du référent
  const credentials = await prisma.credential.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

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
      isAvailable: true,
      courtierNumber: true,
      avatar: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Récupérer les disponibilités des 7 derniers jours pour tous les vendeurs
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // 7 jours incluant aujourd'hui

  const availabilities = await prisma.availability.findMany({
    where: {
      date: {
        gte: sevenDaysAgo,
        lte: today,
      },
      userId: { in: vendeurs.map(v => v.id) },
    },
    select: {
      userId: true,
      date: true,
      slotsJson: true,
    },
    orderBy: {
      date: 'desc',
    },
  });

  // Récupérer les notifications non lues (SAUF performances)
  const unreadCount = await prisma.notification.count({
    where: {
      userId: session.user.id,
      isRead: false,
      kind: 'MESSAGE',
    },
  });

  // Créer une map des disponibilités par userId (pour historique)
  const availabilitiesMap = new Map<string, Array<{ date: Date; slotsJson: string }>>();

  availabilities.forEach(a => {
    if (!availabilitiesMap.has(a.userId)) {
      availabilitiesMap.set(a.userId, []);
    }
    availabilitiesMap.get(a.userId)!.push({ date: a.date, slotsJson: a.slotsJson });
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
        {/* Section Liens et Identifiants */}
        <div className="row mb-4">
          <div className="col-md-6">
            <LinksBlock links={personalLinks} />
          </div>
          <div className="col-md-6">
            <CredentialsBlock credentials={credentials} />
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
          <VendeursTableau
            vendeurs={vendeurs.map(v => ({
              ...v,
              availabilityHistory: availabilitiesMap.get(v.id) || [],
            }))}
          />
        )}
      </div>
    </>
  );
}
