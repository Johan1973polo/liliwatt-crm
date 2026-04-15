'use client';

import { useState, useEffect } from 'react';

interface AudioItem {
  id: string;
  title: string;
  category: string;
  description: string | null;
  driveFileId: string;
  driveUrl: string;
  duration: number | null;
  createdAt: string;
}

export default function AudioDebriefing() {
  const [audios, setAudios] = useState<{ PROSPECTION: AudioItem[]; CLOSING: AudioItem[] }>({ PROSPECTION: [], CLOSING: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/audio')
      .then((r) => r.json())
      .then((d) => { setAudios(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-4"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <div>
      <AudioSection title="📞 Phase Prospection" subtitle="Exemples d'appels R1 réussis" items={audios.PROSPECTION} color="#7c3aed" />
      <AudioSection title="🤝 Phase Closing R2" subtitle="Exemples de closing et négociation" items={audios.CLOSING} color="#d946ef" />
    </div>
  );
}

function AudioSection({ title, subtitle, items, color }: {
  title: string; subtitle: string; items: AudioItem[]; color: string;
}) {
  return (
    <div className="mb-4">
      <h5 style={{ color: '#1e1b4b', fontWeight: 600, borderLeft: `4px solid ${color}`, paddingLeft: '12px', marginBottom: '4px' }}>{title}</h5>
      <p className="text-muted mb-3" style={{ fontSize: '13px', paddingLeft: '16px' }}>{subtitle}</p>
      {items.length === 0 ? (
        <div className="text-center py-4 text-muted" style={{ fontSize: '13px' }}>
          Aucun audio disponible pour le moment
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {items.map((a) => (
            <div key={a.id} className="card" style={{ border: `0.5px solid ${color}30` }}>
              <div className="card-body py-3">
                <strong style={{ color: '#1e1b4b', fontSize: '14px' }}>
                  <i className="bi bi-mic me-1" style={{ color }}></i>{a.title}
                </strong>
                {a.description && <p className="text-muted mb-1" style={{ fontSize: '12px' }}>{a.description}</p>}
                <audio
                  controls
                  src={a.driveUrl}
                  style={{ width: '100%', height: '36px', marginTop: '6px' }}
                  preload="none"
                />
                <small className="text-muted">Ajouté le {new Date(a.createdAt).toLocaleDateString('fr-FR')}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
