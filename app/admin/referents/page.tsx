import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import DeleteReferentButton from './DeleteReferentButton';

export default async function AdminReferentsPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'ADMIN')) {
    redirect('/auth/signin');
  }

  // Récupérer tous les référents avec le nombre de vendeurs
  const referents = await prisma.user.findMany({
    where: { role: 'REFERENT' },
    include: {
      vendeurs: true,
      teamLinks: true,
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
      <Navbar
        userEmail={session.user.email}
        userRole={session.user.role} userAvatar={session.user.avatar}
        notificationCount={unreadCount}
        performancesActivityCount={performancesActivityCount}
      />

      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h2 mb-0">
            <i className="bi bi-person-badge-fill me-2"></i>
            Référents
          </h1>
          <Link href="/admin/referents/new" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Nouveau référent
          </Link>
        </div>

        {referents.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-5">
              <i className="bi bi-inbox display-1 text-muted"></i>
              <p className="text-muted mt-3 mb-0">
                Aucun référent pour le moment. Créez-en un pour commencer.
              </p>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {referents.map((referent) => (
              <div key={referent.id} className="col-md-6 col-lg-4">
                <div className="card card-vendor h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="card-title mb-1">{referent.email}</h5>
                        <p className="text-muted small mb-0">
                          <i className="bi bi-calendar3 me-1"></i>
                          Créé le :{' '}
                          {new Date(referent.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="d-flex gap-2 flex-wrap">
                        <span className="badge bg-info">
                          <i className="bi bi-people me-1"></i>
                          {referent.vendeurs.length} vendeur(s)
                        </span>
                        <span className="badge bg-secondary">
                          <i className="bi bi-link-45deg me-1"></i>
                          {referent.teamLinks.length} lien(s) d&apos;équipe
                        </span>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <Link
                        href={`/admin/referents/${referent.id}/edit`}
                        className="btn btn-info btn-sm flex-grow-1"
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Éditer
                      </Link>
                    </div>

                    <DeleteReferentButton
                      referentId={referent.id}
                      referentEmail={referent.email}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
