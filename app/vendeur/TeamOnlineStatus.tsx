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

  // Ping pour signaler la présence
  const ping = async () => {
    try {
      await fetch('/api/ping', { method: 'POST' });
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    ping();
    fetchStatus();

    const pingInterval = setInterval(ping, 30000);
    const statusInterval = setInterval(fetchStatus, 30000);

    return () => {
      clearInterval(pingInterval);
      clearInterval(statusInterval);
    };
  }, []);

  const onlineCount = team.filter((m) => m.isOnline).length;

  return (
    <div className="card mb-4">
      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="bi bi-people me-2 text-primary"></i>
          Mon equipe en ligne
        </h5>
        <span className="badge bg-success">{onlineCount} en ligne</span>
      </div>
      <div className="card-body p-0">
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
                  {member.isAvailable === true && (
                    <span className="badge bg-success">Disponible</span>
                  )}
                  {member.isAvailable === false && (
                    <span className="badge bg-danger">Non dispo</span>
                  )}
                  {member.isAvailable === null && (
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
