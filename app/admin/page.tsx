import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import RecentDeclarations from './RecentDeclarations';
import AdminVendeursTable from './AdminVendeursTable';

export const revalidate = 0;

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/signin');
  }

  const [recentDeclarations, vendeurs, referents] = await Promise.all([
    prisma.declaration.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true, email: true, courtierNumber: true } } },
    }),
    prisma.user.findMany({
      where: { role: 'VENDEUR', isActive: true },
      select: {
        id: true, email: true, phone: true, courtierNumber: true,
        createdAt: true, lastSeen: true,
        referent: { select: { email: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      where: { role: 'REFERENT', isActive: true },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, createdAt: true, lastSeen: true, linkVisio: true,
        _count: { select: { vendeurs: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const totalVendeurs = vendeurs.length;
  const totalReferents = referents.length;
  const now = Date.now();

  const isOnline = (lastSeen: Date | null) => {
    if (!lastSeen) return false;
    return (now - new Date(lastSeen).getTime()) < 5 * 60 * 1000;
  };

  const thStyle: React.CSSProperties = { padding: '14px 18px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1.5px' };
  const tdStyle: React.CSSProperties = { padding: '14px 18px', verticalAlign: 'middle' };

  // Serialize vendeurs for client component
  const vendeursData = vendeurs.map(v => ({
    id: v.id, email: v.email, phone: v.phone,
    courtierNumber: v.courtierNumber,
    createdAt: v.createdAt.toISOString(),
    lastSeen: v.lastSeen?.toISOString() || null,
    referentEmail: v.referent?.email || null,
  }));

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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isOnline(r.lastSeen) ? '#10b981' : '#9ca3af', flexShrink: 0 }}
                          title={isOnline(r.lastSeen) ? 'En ligne' : 'Hors ligne'} />
                        <div>
                          <div style={{ fontWeight: 600, color: '#1e1b4b' }}>{r.firstName} {r.lastName}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{r.email}</div>
                        </div>
                      </div>
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
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e1b4b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="bi bi-person-fill"></i> Vendeurs ({totalVendeurs})
            </h2>
            <div style={{ background: 'linear-gradient(135deg, #f5f3ff, #fae8ff)', border: '1px solid #d946ef', borderRadius: '12px', padding: '8px 14px', fontSize: '12px', color: '#1e1b4b' }}>
              <strong>Creation via LILIWATT Admin</strong>
            </div>
          </div>
          <AdminVendeursTable vendeurs={vendeursData} />
        </section>
      </div>
    </>
  );
}
