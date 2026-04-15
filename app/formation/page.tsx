import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import ModuleCard from './ModuleCard';
import FormationTabs from './FormationTabs';

export const revalidate = 0;

export default async function FormationPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  // Récupérer tous les modules
  const modules = await prisma.trainingModule.findMany({
    orderBy: { order: 'asc' },
  });

  // Récupérer la progression de l'utilisateur
  const progress = await prisma.trainingProgress.findMany({
    where: { sellerId: session.user.id },
    include: {
      unlocker: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  // Créer un map moduleId -> progress
  const progressMap = new Map(progress.map(p => [p.moduleId, p]));

  // Enrichir les modules avec la progression
  const modulesWithProgress = modules.map(module => {
    const prog = progressMap.get(module.id);
    return {
      id: module.id,
      title: module.title,
      description: module.description,
      order: module.order,
      icon: module.icon,
      durationEstimated: module.durationEstimated,
      status: prog?.status || 'LOCKED',
      unlockedBy: prog?.unlocker
        ? (prog.unlocker.firstName && prog.unlocker.lastName
            ? `${prog.unlocker.firstName} ${prog.unlocker.lastName}`
            : prog.unlocker.email)
        : null,
      unlockedAt: prog?.unlockedAt,
      startedAt: prog?.startedAt,
      completedAt: prog?.completedAt,
      score: prog?.score,
    };
  });

  // Calculer la progression globale
  const completedCount = modulesWithProgress.filter(m => m.status === 'COMPLETED').length;
  const totalCount = modulesWithProgress.length;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);

  // Compter les notifications non lues
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

      <div className="container-fluid py-4">
        {/* En-tête */}
        <div className="mb-4">
          <h1 className="h2 mb-1">
            <i className="bi bi-mortarboard me-2"></i>
            Formation
          </h1>
          <p className="text-muted mb-0">
            Développez vos compétences avec nos modules de formation
          </p>
        </div>

        {/* Barre de progression globale */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Votre progression globale
              </h5>
              <span className="badge bg-primary fs-6">
                {completedCount}/{totalCount} modules complétés
              </span>
            </div>
            <div className="progress" style={{ height: '25px' }}>
              <div
                className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                role="progressbar"
                style={{ width: `${progressPercentage}%` }}
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <strong>{progressPercentage}%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets Modules / Débriefing */}
        <FormationTabs>
          {/* Légende des statuts */}
          <div className="card mb-4">
            <div className="card-body py-3">
              <div className="row text-center g-3">
                <div className="col-md-3">
                  <span className="badge bg-secondary">
                    <i className="bi bi-lock-fill me-1"></i>
                    Verrouillé
                  </span>
                </div>
                <div className="col-md-3">
                  <span className="badge bg-success">
                    <i className="bi bi-unlock-fill me-1"></i>
                    Déverrouillé
                  </span>
                </div>
                <div className="col-md-3">
                  <span className="badge bg-warning text-dark">
                    <i className="bi bi-hourglass-split me-1"></i>
                    En cours
                  </span>
                </div>
                <div className="col-md-3">
                  <span className="badge bg-primary">
                    <i className="bi bi-check-circle-fill me-1"></i>
                    Complété
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des modules */}
          <div className="row g-4">
            {modulesWithProgress.map(module => (
              <div key={module.id} className="col-md-6 col-lg-4">
                <ModuleCard module={module} />
              </div>
            ))}
          </div>

          {/* Message d'aide */}
          {completedCount === 0 && (
            <div className="alert alert-info mt-4">
              <i className="bi bi-info-circle me-2"></i>
              <strong>Bienvenue dans votre espace de formation !</strong>
              <p className="mb-0 mt-2">
                Votre référent déverrouillera progressivement les modules pour vous.
                Une fois déverrouillés, vous pourrez commencer votre apprentissage.
              </p>
            </div>
          )}
        </FormationTabs>
      </div>
    </>
  );
}
