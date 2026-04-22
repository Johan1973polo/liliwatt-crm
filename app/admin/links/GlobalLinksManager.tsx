'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Link {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  subtitle: string | null;
  order: number;
  scope: string;
}

const SCOPE_LABELS: Record<string, string> = {
  GLOBAL: 'Tous',
  GLOBAL_REFERENT: 'Referents',
  GLOBAL_VENDOR: 'Vendeurs',
};

export default function GlobalLinksManager({ initialLinks }: { initialLinks: Link[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('🔗');
  const [scope, setScope] = useState('GLOBAL');

  const handleAdd = async () => {
    if (!title.trim() || !url.trim()) { alert('Nom et URL obligatoires'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/links/global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), url: url.trim(), icon, subtitle: subtitle.trim() || null, scope }),
      });
      if (res.ok) {
        setTitle(''); setSubtitle(''); setUrl(''); setIcon('🔗'); setScope('GLOBAL');
        router.refresh();
      } else { alert('Erreur lors de l\'ajout'); }
    } catch { alert('Erreur reseau'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (linkId: string) => {
    if (!confirm('Supprimer ce lien ?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/links/${linkId}`, { method: 'DELETE' });
      if (res.ok) { router.refresh(); } else { alert('Erreur lors de la suppression'); }
    } catch { alert('Erreur reseau'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      {/* Formulaire ajout */}
      <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e1b4b', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="bi bi-plus-circle"></i> Ajouter un nouveau lien
        </h3>

        {/* Ligne 1 : Nom + Sous-titre */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px', display: 'block' }}>Nom du lien *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Script telephonique R2"
              disabled={loading} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px' }} />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px', display: 'block' }}>Sous-titre (optionnel)</label>
            <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Ex: Argumentaire client PME"
              disabled={loading} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px' }} />
          </div>
        </div>

        {/* Ligne 2 : URL + Icone + Visibilite + Ajouter */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 100px 1fr auto', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px', display: 'block' }}>URL *</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..."
              disabled={loading} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px' }} />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px', display: 'block' }}>Icone</label>
            <select value={icon} onChange={e => setIcon(e.target.value)} disabled={loading}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '20px', textAlign: 'center' }}>
              {['🔗','🌐','📄','📊','🎓','🎯','⚡','💼','💎','🔒','📱','🆘','📋','🎤','🔥'].map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px', display: 'block' }}>Visible par</label>
            <select value={scope} onChange={e => setScope(e.target.value)} disabled={loading}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px' }}>
              <option value="GLOBAL">Tous</option>
              <option value="GLOBAL_REFERENT">Referents</option>
              <option value="GLOBAL_VENDOR">Vendeurs</option>
            </select>
          </div>
          <button onClick={handleAdd} disabled={loading || !title.trim() || !url.trim()}
            style={{ background: 'linear-gradient(135deg, #7c3aed, #d946ef)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', height: '42px', opacity: loading ? 0.6 : 1 }}>
            <i className="bi bi-plus-lg me-1"></i> Ajouter
          </button>
        </div>
      </div>

      {/* Liste des liens existants */}
      <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e1b4b', marginBottom: '18px' }}>
          <i className="bi bi-list-ul me-2"></i>Liens existants ({initialLinks.length})
        </h3>

        {initialLinks.length === 0 ? (
          <p className="text-muted mb-0">Aucun lien global pour le moment.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}></th>
                  <th>Nom</th>
                  <th>Sous-titre</th>
                  <th style={{ width: '140px' }}>Visible par</th>
                  <th>URL</th>
                  <th style={{ width: '80px' }}></th>
                </tr>
              </thead>
              <tbody>
                {initialLinks.map((link) => (
                  <tr key={link.id}>
                    <td className="align-middle text-center" style={{ fontSize: '24px' }}>{link.icon || '🔗'}</td>
                    <td className="align-middle fw-semibold">{link.title}</td>
                    <td className="align-middle text-muted" style={{ fontSize: '13px' }}>{link.subtitle || '—'}</td>
                    <td className="align-middle">
                      <span className={`badge ${link.scope === 'GLOBAL' ? 'bg-primary' : link.scope === 'GLOBAL_REFERENT' ? 'bg-info' : 'bg-success'}`}>
                        {SCOPE_LABELS[link.scope] || link.scope}
                      </span>
                    </td>
                    <td className="align-middle">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-decoration-none" style={{ fontSize: '13px' }}>
                        {link.url.length > 50 ? link.url.substring(0, 50) + '...' : link.url}
                        <i className="bi bi-box-arrow-up-right ms-1 small"></i>
                      </a>
                    </td>
                    <td className="align-middle text-end">
                      <button onClick={() => handleDelete(link.id)} className="btn btn-sm btn-outline-danger" disabled={loading}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
