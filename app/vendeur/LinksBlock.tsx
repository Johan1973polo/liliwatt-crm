'use client';

import useSWR from 'swr';

interface Link {
  id: string;
  title: string;
  url: string;
  scope: string;
}

const fetcher = (url: string) => fetch(url).then(r => r.json()).catch(() => ({ links: [] }));

export default function LinksBlock() {
  const { data } = useSWR('/api/links/visible', fetcher, { refreshInterval: 60000 });
  const links: Link[] = data?.links || [];

  if (links.length === 0) return null;

  const globalLinks = links.filter(l => l.scope.startsWith('GLOBAL'));
  const teamLinks = links.filter(l => l.scope === 'TEAM');
  const userLinks = links.filter(l => l.scope === 'USER');

  return (
    <div className="card mb-4">
      <div className="card-header bg-white">
        <h5 className="mb-0">
          <i className="bi bi-link-45deg me-2"></i>
          Mes boutons / liens
        </h5>
      </div>
      <div className="card-body">
        {globalLinks.length > 0 && (
          <>
            <div style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '2px',
              textTransform: 'uppercase', color: '#7c3aed', marginBottom: '12px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <i className="bi bi-globe2"></i> Liens LILIWATT
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '12px', marginBottom: globalLinks.length > 0 && (teamLinks.length > 0 || userLinks.length > 0) ? '20px' : '0',
            }}>
              {globalLinks.map(link => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    background: 'linear-gradient(135deg, #f5f3ff, #fae8ff)',
                    border: '1px solid #e9d5ff', borderRadius: '12px',
                    padding: '14px 18px', textDecoration: 'none',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e9d5ff'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <span style={{ fontSize: '20px' }}><i className="bi bi-box-arrow-up-right" style={{ color: '#7c3aed' }}></i></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px', fontWeight: 700, color: '#1e1b4b',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {link.title}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}

        {teamLinks.length > 0 && (
          <>
            <div style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '2px',
              textTransform: 'uppercase', color: '#ea580c', marginBottom: '12px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <i className="bi bi-people"></i> Liens equipe
            </div>
            <div className="d-grid gap-2" style={{ marginBottom: userLinks.length > 0 ? '20px' : '0' }}>
              {teamLinks.map(link => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="btn btn-outline-warning text-start">
                  <i className="bi bi-box-arrow-up-right me-2"></i>{link.title}
                </a>
              ))}
            </div>
          </>
        )}

        {userLinks.length > 0 && (
          <>
            <div style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '2px',
              textTransform: 'uppercase', color: '#6b7280', marginBottom: '12px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <i className="bi bi-bookmark"></i> Mes liens perso
            </div>
            <div className="d-grid gap-2">
              {userLinks.map(link => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    background: '#f9fafb', border: '1px solid #e5e7eb',
                    borderRadius: '12px', padding: '12px 18px',
                    textDecoration: 'none', color: '#1e1b4b', fontSize: '14px',
                    display: 'block',
                  }}>
                  <i className="bi bi-box-arrow-up-right me-2" style={{ color: '#6b7280' }}></i>{link.title}
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
