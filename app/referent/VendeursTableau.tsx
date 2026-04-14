'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TeamMember {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  courtierNumber: number | null;
  isOnline: boolean;
  lastSeen: string | null;
  lastSeenAgo: string;
}

interface Vendeur {
  id: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  isActive: boolean;
  courtierNumber: number | null;
  avatar: string | null;
}

export default function VendeursTableau({ vendeurs }: { vendeurs: Vendeur[] }) {
  const [teamStatus, setTeamStatus] = useState<TeamMember[]>([]);

  const loadTeamStatus = async () => {
    try {
      const res = await fetch('/api/team-status');
      if (res.ok) {
        const data = await res.json();
        setTeamStatus(data);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadTeamStatus();
    const t = setInterval(loadTeamStatus, 10000);
    return () => clearInterval(t);
  }, []);

  const getStatus = (vendeurId: string) => {
    return teamStatus.find((m) => m.id === vendeurId);
  };

  return (
    <div className="card">
      <div className="card-header bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-table me-2"></i>
            Vue d&apos;ensemble de l&apos;équipe
          </h5>
          <small className="text-muted">
            <i className="bi bi-arrow-clockwise me-1"></i>
            Actualisation toutes les 10s
          </small>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>Statut</th>
              <th>Email</th>
              <th>N° Courtier</th>
              <th>Téléphone</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendeurs.map((vendeur) => {
              const status = getStatus(vendeur.id);
              const isOnline = status?.isOnline ?? false;

              return (
                <tr key={vendeur.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {isOnline ? (
                        <span className="position-relative d-inline-block" style={{ width: '14px', height: '14px' }}>
                          <span
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              background: '#16a34a',
                              animation: 'pulse-dot 2s ease-in-out infinite',
                            }}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              background: '#16a34a',
                            }}
                          />
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-block',
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            background: '#9ca3af',
                          }}
                        />
                      )}
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: isOnline ? '#16a34a' : '#6b7280' }}>
                          {isOnline ? 'En ligne' : 'Hors ligne'}
                        </div>
                        {!isOnline && status?.lastSeenAgo && (
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                            {status.lastSeenAgo}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-person-circle me-2 text-muted"></i>
                      <span className={!vendeur.isActive ? 'text-muted text-decoration-line-through' : ''}>
                        {vendeur.email}
                      </span>
                    </div>
                  </td>
                  <td>
                    {vendeur.courtierNumber ? (
                      <span className="badge bg-primary">N°{vendeur.courtierNumber}</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    {vendeur.phone ? (
                      <a href={`tel:${vendeur.phone}`} className="text-decoration-none">
                        <i className="bi bi-telephone me-1"></i>
                        {vendeur.phone}
                      </a>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm">
                      <Link
                        href={`/referent/vendors/${vendeur.id}/edit?view=true`}
                        className="btn btn-outline-info"
                        title="Consulter"
                      >
                        <i className="bi bi-eye"></i>
                      </Link>
                      <Link
                        href={`/referent/messages?contact=${vendeur.id}`}
                        className="btn btn-outline-secondary"
                      >
                        <i className="bi bi-chat-dots"></i>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.6); }
        }
      `}</style>
    </div>
  );
}
