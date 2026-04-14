import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import ActivityForm from './ActivityForm';
import ActivityList from './ActivityList';

export const revalidate = 0;

export default async function AdminActivitiesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  // Récupérer les 50 dernières activités
  const activities = await prisma.teamActivity.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  // Compter les notifications non lues (SAUF performances)
  const notificationCount = await prisma.notification.count({
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
        notificationCount={notificationCount}
        performancesActivityCount={performancesActivityCount}
      />

      <div className="container-fluid py-4">
        <div className="mb-4">
          <h1 className="h2 mb-1">
            <i className="bi bi-activity me-2"></i>
            Gestion des Activités
          </h1>
          <p className="text-muted mb-0">
            Créez des activités fictives pour motiver l&apos;équipe
          </p>
        </div>

        <div className="row g-4">
          {/* Formulaire de création */}
          <div className="col-lg-5">
            <ActivityForm />
          </div>

          {/* Liste des activités */}
          <div className="col-lg-7">
            <ActivityList initialActivities={activities} />
          </div>
        </div>

        {/* Informations complémentaires */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-info-circle me-2"></i>
                  Comment ça fonctionne ?
                </h5>
                <div className="row">
                  <div className="col-md-4">
                    <div className="bg-light p-3 rounded">
                      <h6 className="text-primary">
                        <i className="bi bi-1-circle me-2"></i>
                        Activités fictives
                      </h6>
                      <p className="small mb-0">
                        Vous pouvez créer manuellement des activités fictives
                        (ventes, factures, messages personnalisés) pour motiver
                        votre équipe et simuler une activité importante.
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="bg-light p-3 rounded">
                      <h6 className="text-success">
                        <i className="bi bi-2-circle me-2"></i>
                        Activités réelles
                      </h6>
                      <p className="small mb-0">
                        Lorsqu&apos;un vendeur déclarera une vraie vente ou
                        récupérera une facture, une activité réelle sera
                        automatiquement créée (fonctionnalité à venir).
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="bg-light p-3 rounded">
                      <h6 className="text-warning">
                        <i className="bi bi-3-circle me-2"></i>
                        Affichage anonyme
                      </h6>
                      <p className="small mb-0">
                        Les vendeurs voient toutes les activités de manière
                        anonyme (&quot;Un courtier a...&quot;) et ne peuvent
                        pas distinguer les vraies des fictives.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
