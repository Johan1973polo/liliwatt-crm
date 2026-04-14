import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import InitButton from './InitButton';

export const revalidate = 0;

export default async function FormationInitPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  // Compter les modules existants
  const moduleCount = await prisma.trainingModule.count();

  // Compter les notifications
  const notificationCount = await prisma.notification.count({
    where: {
      userId: session.user.id,
      isRead: false,
      kind: 'MESSAGE',
    },
  });

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

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h3 className="mb-0">
                  <i className="bi bi-mortarboard me-2"></i>
                  Initialisation des modules de formation
                </h3>
              </div>
              <div className="card-body">
                {moduleCount > 0 ? (
                  <div className="alert alert-success">
                    <i className="bi bi-check-circle me-2"></i>
                    <strong>Modules déjà initialisés !</strong>
                    <p className="mb-0 mt-2">
                      {moduleCount} module(s) de formation sont déjà présents dans la base de données.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>Aucun module détecté</strong>
                      <p className="mb-0 mt-2">
                        Cliquez sur le bouton ci-dessous pour initialiser les 9 modules de formation.
                      </p>
                    </div>

                    <div className="mb-4">
                      <h5>Modules qui seront créés :</h5>
                      <ol>
                        <li>Architecture du marché de l&apos;énergie (45 min)</li>
                        <li>Lecture experte d&apos;une facture (40 min)</li>
                        <li>Comprendre la dynamique des prix (35 min)</li>
                        <li>Psychologie du dirigeant B2B (50 min)</li>
                        <li>Argumentaire téléphonique R1 (60 min)</li>
                        <li>Gestion des objections avancée (45 min)</li>
                        <li>Fidélisation et upselling (40 min)</li>
                        <li>Organisation en télétravail (30 min)</li>
                        <li>Manuel interne destiné aux référents (90 min)</li>
                      </ol>
                    </div>

                    <InitButton />
                  </>
                )}

                <div className="mt-4">
                  <a href="/formation" className="btn btn-outline-primary me-2">
                    <i className="bi bi-arrow-left me-2"></i>
                    Voir mes formations
                  </a>
                  <a href="/formation/gestion" className="btn btn-outline-secondary">
                    <i className="bi bi-gear me-2"></i>
                    Gestion des formations
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
