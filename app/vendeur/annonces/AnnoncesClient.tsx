'use client';

import { useEffect, useState } from 'react';
import { mutate } from 'swr';

interface Announcement {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  referent: { firstName: string | null; lastName: string | null };
  reads: { readAt: string }[];
}

export default function AnnoncesClient({ announcements }: { announcements: Announcement[] }) {
  const [marked, setMarked] = useState(false);

  useEffect(() => {
    if (!marked && announcements.some(a => a.reads.length === 0)) {
      fetch('/api/referent/announcements/mark-read', { method: 'POST' })
        .then(() => mutate('/api/referent/announcements/count-unread'));
      setMarked(true);
    }
  }, [announcements, marked]);

  if (announcements.length === 0) {
    return (
      <div className="text-center text-muted py-5">
        <i className="bi bi-megaphone" style={{ fontSize: '3rem' }}></i>
        <p className="mt-3">Aucune annonce pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {announcements.map((ann) => {
        const isUnread = ann.reads.length === 0;
        const date = new Date(ann.createdAt);
        const refName = [ann.referent.firstName, ann.referent.lastName].filter(Boolean).join(' ') || 'Referent';

        return (
          <div
            key={ann.id}
            className={`card ${isUnread ? 'border-warning' : ''}`}
            style={isUnread ? { borderLeft: '4px solid #ffc107' } : {}}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h6 className="card-title mb-0">
                  {isUnread && <i className="bi bi-circle-fill text-warning me-2" style={{ fontSize: '8px' }}></i>}
                  {ann.title}
                </h6>
                <small className="text-muted">
                  {date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  {' '}
                  {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </small>
              </div>
              <p className="card-text mb-2" style={{ whiteSpace: 'pre-wrap' }}>{ann.message}</p>
              <small className="text-muted">
                <i className="bi bi-person me-1"></i>{refName}
              </small>
            </div>
          </div>
        );
      })}
    </div>
  );
}
