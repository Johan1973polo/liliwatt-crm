import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import DeleteVendorButton from './DeleteVendorButton';
import RecentDeclarations from './RecentDeclarations';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'ADMIN')) {
    redirect('/auth/signin');
  }

  const [recentDeclarations, vendeurs, referents] = await Promise.all([
    prisma.declaration.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true, email: true, courtierNumber: true } } },
    }),
    prisma.user.findMany({
      where: { role: 'VENDEUR' },
      include: {
        credentials: true,
        personalLinks: true,
        referent: { select: { email: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      where: { role: 'REFERENT', isActive: true },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, createdAt: true, linkVisio: true,
        _count: { select: { vendeurs: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const totalVendeurs = vendeurs.filter(v => v.isActive !== false).length;
  const totalReferents = referents.length;

  const thStyle = { padding: '12px 16px', textAlign: 'left' as const, fontSize: '12px', fontWeight: 700, color: '#7c3aed', letterSpacing: '1px', textTransform: 'uppercase' as const };
  const tdStyle = { padding: '14px 16px' };

  return (
    <>
      <Navbar userEmail={session.user.email} userRole={session.user.role} userAvatar={session.user.avatar} />

      <div className="container-fluid py-4">
        {/* Compteurs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #d946ef 100%)', borderRadius: '16px', padding: '22px 24px', color: 'white', boxShadow: '0 8px 28px rgba(124, 58, 237, 0.25)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.85, marginBottom: '8px' }}>Equipe</div>
            <div style={{ fontSize: '38px', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: '4px' }}>{totalVendeurs + totalReferents}</div>
            <div style={{ fontSize: '13px', opacity: 0.9 }}>Collaborateurs actifs</div>
          </div>
          <div style={{ background: 'white', border: '1px solid #e9d5ff', borderRadius: '16px', padding: '22px 24px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '8px' }}>Referents</div>
            <div style={{ fontSize: '38px', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.1, color: '#1e1b4b', marginBottom: '4px' }}>{totalReferents}</div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>Superviseurs d&apos;equipe</div>
          </div>
          <div style={{ background: 'white', border: '1px solid #e9d5ff', borderRadius: '16px', padding: '22px 24px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#d946ef', marginBottom: '8px' }}>Vendeurs</div>
            <div style={{ fontSize: '38px', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.1, color: '#1e1b4b', marginBottom: '4px' }}>{totalVendeurs}</div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>Commerciaux actifs</div>
          </div>
        </div>

        {/* Declarations recentes */}
        <RecentDeclarations declarations={JSON.parse(JSON.stringify(recentDeclarations))} />

        {/* Tableau Referents */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e1b4b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="bi bi-people-fill"></i> Referents ({totalReferents})
          </h2>
          <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e9d5ff', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f3ff' }}>
                  <th style={thStyle}>Referent</th>
                  <th style={thStyle}>Telephone</th>
                  <th style={thStyle}>Vendeurs</th>
                  <th style={thStyle}>Salon Meet</th>
                  <th style={thStyle}>Cree le</th>
                </tr>
              </thead>
              <tbody>
                {referents.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, color: '#1e1b4b' }}>{r.firstName} {r.lastName}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{r.email}</div>
                    </td>
                    <td style={{ ...tdStyle, color: '#6b7280', fontSize: '13px' }}>{r.phone || '—'}</td>
                    <td style={tdStyle}>
                      <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
                        {r._count.vendeurs} vendeur{r._count.vendeurs > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {r.linkVisio ? (
                        <a href={r.linkVisio} target="_blank" rel="noopener noreferrer" style={{ color: '#7c3aed', fontSize: '12px', textDecoration: 'none' }}>
                          <i className="bi bi-camera-video me-1"></i>Rejoindre
                        </a>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, fontSize: '13px', color: '#6b7280' }}>{new Date(r.createdAt).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Tableau Vendeurs */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e1b4b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="bi bi-person-fill"></i> Vendeurs ({totalVendeurs})
          </h2>
          <div style={{ background: 'linear-gradient(135deg, #f5f3ff, #fae8ff)', border: '1px solid #d946ef', borderRadius: '12px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#1e1b4b' }}>
            <span style={{ fontSize: '18px' }}>ℹ️</span>
            <span><strong>Creation via LILIWATT Admin</strong></span>
          </div>
        </div>

        {vendeurs.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-5">
              <i className="bi bi-inbox display-1 text-muted"></i>
              <p className="text-muted mt-3 mb-0">Aucun vendeur pour le moment.</p>
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
                      <th>N Courtier</th>
                      <th>Referent</th>
                      <th>Telephone</th>
                      <th className="text-center">Identifiants</th>
                      <th className="text-center">Liens perso</th>
                      <th className="text-center">Statut</th>
                      <th>Cree le</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendeurs.map((vendeur) => (
                      <tr key={vendeur.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {vendeur.avatar && (
                              <Image src={vendeur.avatar} alt={vendeur.email} width={35} height={35}
                                className="rounded-circle" style={{ objectFit: 'cover' }} />
                            )}
                            <span className="fw-semibold">{vendeur.email}</span>
                          </div>
                        </td>
                        <td>
                          {vendeur.courtierNumber ? (
                            <span className="badge bg-primary">N {vendeur.courtierNumber}</span>
                          ) : (
                            <span className="badge bg-warning text-dark"><i className="bi bi-exclamation-triangle me-1"></i>Non attribue</span>
                          )}
                        </td>
                        <td>
                          {vendeur.referent ? (
                            <span className="text-muted"><i className="bi bi-person-badge me-1"></i>{vendeur.referent.email}</span>
                          ) : (<span className="text-muted">-</span>)}
                        </td>
                        <td>
                          {vendeur.phone ? (
                            <span className="text-muted"><i className="bi bi-telephone me-1"></i>{vendeur.phone}</span>
                          ) : (<span className="text-muted">-</span>)}
                        </td>
                        <td className="text-center"><span className="badge bg-info">{vendeur.credentials.length}</span></td>
                        <td className="text-center"><span className="badge bg-secondary">{vendeur.personalLinks.length}</span></td>
                        <td className="text-center">
                          {vendeur.isAvailable === null ? (
                            <span className="badge bg-secondary"><i className="bi bi-question-circle me-1"></i>Aucune</span>
                          ) : vendeur.isAvailable ? (
                            <span className="badge bg-success"><i className="bi bi-check-circle me-1"></i>Dispo</span>
                          ) : (
                            <span className="badge bg-danger"><i className="bi bi-x-circle me-1"></i>Non dispo</span>
                          )}
                        </td>
                        <td><span className="text-muted small">{new Date(vendeur.createdAt).toLocaleDateString('fr-FR')}</span></td>
                        <td>
                          <div className="d-flex gap-1 justify-content-end">
                            <Link href={`/admin/vendors/${vendeur.id}/edit`} className="btn btn-sm btn-info" title="Editer">
                              <i className="bi bi-pencil"></i>
                            </Link>
                            <DeleteVendorButton vendorId={vendeur.id} vendorEmail={vendeur.email} inline={true} />
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
