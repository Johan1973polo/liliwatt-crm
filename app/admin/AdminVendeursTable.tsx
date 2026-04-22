'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Vendeur {
  id: string;
  email: string;
  phone: string | null;
  courtierNumber: number | null;
  createdAt: string;
  lastSeen: string | null;
  referentEmail: string | null;
}

export default function AdminVendeursTable({ vendeurs }: { vendeurs: Vendeur[] }) {
  const router = useRouter();
  const [editVendeur, setEditVendeur] = useState<Vendeur | null>(null);
  const [newPhone, setNewPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editVendeur) setNewPhone(editVendeur.phone || '');
  }, [editVendeur]);

  const isOnline = (lastSeen: string | null) => {
    if (!lastSeen) return false;
    return (Date.now() - new Date(lastSeen).getTime()) < 5 * 60 * 1000;
  };

  const handleSavePhone = async () => {
    if (!editVendeur) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/users/update-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: editVendeur.id, phone: newPhone }),
      });
      if (res.ok) {
        setEditVendeur(null);
        router.refresh();
      } else { alert('Erreur lors de la sauvegarde'); }
    } catch { alert('Erreur reseau'); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e9d5ff', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f3ff' }}>
              <th style={thStyle}>Vendeur</th>
              <th style={thStyle}>N Courtier</th>
              <th style={thStyle}>Referent</th>
              <th style={thStyle}>Telephone</th>
              <th style={thStyle}>Cree le</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {vendeurs.map((v) => (
              <tr key={v.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                      background: isOnline(v.lastSeen) ? '#10b981' : '#9ca3af',
                    }} title={isOnline(v.lastSeen) ? 'En ligne' : 'Hors ligne'} />
                    <div style={{ fontWeight: 600, color: '#1e1b4b', fontSize: '14px' }}>{v.email}</div>
                  </div>
                </td>
                <td style={tdStyle}>
                  {v.courtierNumber ? (
                    <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
                      N{v.courtierNumber}
                    </span>
                  ) : (
                    <span style={{ color: '#9ca3af', fontSize: '12px' }}>—</span>
                  )}
                </td>
                <td style={{ ...tdStyle, fontSize: '13px', color: '#6b7280' }}>
                  {v.referentEmail || '—'}
                </td>
                <td style={{ ...tdStyle, fontSize: '13px', color: '#6b7280' }}>
                  {v.phone || '—'}
                </td>
                <td style={{ ...tdStyle, fontSize: '13px', color: '#6b7280' }}>
                  {new Date(v.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <button onClick={() => setEditVendeur(v)} style={{
                    background: 'linear-gradient(135deg, #7c3aed, #d946ef)',
                    color: 'white', border: 'none', padding: '6px 14px',
                    borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                  }}>
                    <i className="bi bi-pencil me-1"></i>Modifier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal edit telephone */}
      {editVendeur && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px',
        }} onClick={() => !saving && setEditVendeur(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: '20px', padding: '32px',
            maxWidth: '420px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e1b4b', marginBottom: '6px', letterSpacing: '-0.3px' }}>
              Modifier {editVendeur.email}
            </h2>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>
              Mise a jour du numero de telephone
            </p>

            <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', display: 'block' }}>
              Telephone
            </label>
            <input type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value)}
              placeholder="06 XX XX XX XX" autoFocus disabled={saving}
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', marginBottom: '24px' }} />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setEditVendeur(null)} disabled={saving} style={{
                flex: 1, padding: '12px', background: '#f3f4f6', color: '#6b7280',
                border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer',
              }}>Annuler</button>
              <button onClick={handleSavePhone} disabled={saving} style={{
                flex: 2, padding: '12px',
                background: 'linear-gradient(135deg, #7c3aed, #d946ef)',
                color: 'white', border: 'none', borderRadius: '10px',
                fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1,
              }}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const thStyle: React.CSSProperties = {
  padding: '14px 18px', textAlign: 'left', fontSize: '11px', fontWeight: 700,
  color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1.5px',
};
const tdStyle: React.CSSProperties = { padding: '14px 18px', verticalAlign: 'middle' };
