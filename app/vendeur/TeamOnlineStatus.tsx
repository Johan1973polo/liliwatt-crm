'use client';

import { useState, useEffect } from 'react';

interface TeamMember {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  courtierNumber: number | null;
  isOnline: boolean;
  isAvailable: boolean | null;
  lastSeen: string | null;
}

export default function TeamOnlineStatus() {
  const [team, setTeam] = useState<TeamMember[]>([]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/team-status');
      if (res.ok) {
        const data = await res.json();
        setTeam(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStatus();
    const statusInterval = setInterval(fetchStatus, 10000);
    return () => clearInterval(statusInterval);
  }, []);

  const onlineCount = team.filter((m) => m.isOnline).length;

  return (
    <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '20px', border: '1px solid #fce7f3' }}>
      <div style={{ background: '#9d174d', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }}></span>
          <span style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>👥 Mon équipe en ligne</span>
        </div>
        <span className="badge bg-success" style={{ fontSize: '11px' }}>{onlineCount} en ligne</span>
      </div>
      <div style={{ background: 'white' }}>
        {team.length === 0 ? (
          <div className="text-center py-3 text-muted">
            <i className="bi bi-people"></i> Aucun collegue trouve
          </div>
        ) : (
          <ul className="list-group list-group-flush">
            {team.map((member) => (
              <li key={member.id} className="list-group-item d-flex justify-content-between align-items-center py-2">
                <div className="d-flex align-items-center gap-2">
                  <span style={{ fontSize: '1.2rem' }}>
                    {member.isOnline ? '\u{1F7E2}' : '\u26AB'}
                  </span>
                  <div>
                    <span className="fw-semibold">
                      {member.firstName || member.email.split('@')[0]}
                      {member.lastName ? ` ${member.lastName}` : ''}
                    </span>
                    {member.courtierNumber && (
                      <span className="badge bg-primary ms-2" style={{ fontSize: '0.7rem' }}>
                        N{member.courtierNumber}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  {member.isOnline ? (
                    <span className="badge bg-success">En ligne</span>
                  ) : member.lastSeen ? (
                    <span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>
                      Hors ligne {(() => {
                        const diff = Math.floor((Date.now() - new Date(member.lastSeen).getTime()) / 60000);
                        if (diff < 1) return 'à l\'instant';
                        if (diff < 60) return `il y a ${diff} min`;
                        return `il y a ${Math.floor(diff / 60)}h`;
                      })()}
                    </span>
                  ) : (
                    <span className="badge bg-secondary">-</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
