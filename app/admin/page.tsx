import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import DeleteVendorButton from './DeleteVendorButton';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'ADMIN')) {
    redirect('/auth/signin');
  }

  // Récupérer tous les vendeurs avec leurs identifiants, liens et référent
  const vendeurs = await prisma.user.findMany({
    where: { role: 'VENDEUR' },
    include: {
      credentials: true,
      personalLinks: true,
      referent: {
        select: {
          email: true,
        },
      },
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
        userRole={session.user.role}
        userAvatar={session.user.avatar}
        notificationCount={unreadCount}
        performancesActivityCount={performancesActivityCount}
      />

      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h2 mb-0">
            <i className="bi bi-people-fill me-2"></i>
            Vendeurs
          </h1>
          <Link href="/admin/vendors/new" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Nouveau vendeur
          </Link>
        </div>

        {vendeurs.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-5">
              <i className="bi bi-inbox display-1 text-muted"></i>
              <p className="text-muted mt-3 mb-0">
                Aucun vendeur pour le moment. Créez-en un pour commencer.
              </p>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Vendeur</th>
                      <th>N° Courtier</th>
                      <th>Référent</th>
                      <th>Téléphone</th>
                      <th className="text-center">Identifiants</th>
                      <th className="text-center">Liens perso</th>
                      <th className="text-center">Statut</th>
                      <th>Créé le</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendeurs.map((vendeur) => (
                      <tr key={vendeur.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {vendeur.avatar && (
                              <Image
                                src={vendeur.avatar}
                                alt={vendeur.email}
                                width={35}
                                height={35}
                                className="rounded-circle"
                                style={{ objectFit: 'cover' }}
                              />
                            )}
                            <span className="fw-semibold">{vendeur.email}</span>
                          </div>
                        </td>
                        <td>
                          {vendeur.courtierNumber ? (
                            <span className="badge bg-primary">
                              N° {vendeur.courtierNumber}
                            </span>
                          ) : (
                            <span className="badge bg-warning text-dark">
                              <i className="bi bi-exclamation-triangle me-1"></i>
                              Non attribué
                            </span>
                          )}
                        </td>
                        <td>
                          {vendeur.referent ? (
                            <span className="text-muted">
                              <i className="bi bi-person-badge me-1"></i>
                              {vendeur.referent.email}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {vendeur.phone ? (
                            <span className="text-muted">
                              <i className="bi bi-telephone me-1"></i>
                              {vendeur.phone}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="text-center">
                          <span className="badge bg-info">
                            {vendeur.credentials.length}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-secondary">
                            {vendeur.personalLinks.length}
                          </span>
                        </td>
                        <td className="text-center">
                          {vendeur.isAvailable === null ? (
                            <span className="badge bg-secondary">
                              <i className="bi bi-question-circle me-1"></i>
                              Aucune déclaration
                            </span>
                          ) : vendeur.isAvailable ? (
                            <span className="badge bg-success">
                              <i className="bi bi-check-circle me-1"></i>
                              Disponible
                            </span>
                          ) : (
                            <span className="badge bg-danger">
                              <i className="bi bi-x-circle me-1"></i>
                              Non disponible
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="text-muted small">
                            {new Date(vendeur.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-1 justify-content-end">
                            <Link
                              href={`/admin/vendors/${vendeur.id}/edit`}
                              className="btn btn-sm btn-info"
                              title="Éditer"
                            >
                              <i className="bi bi-pencil"></i>
                            </Link>
                            <DeleteVendorButton
                              vendorId={vendeur.id}
                              vendorEmail={vendeur.email}
                              inline={true}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
