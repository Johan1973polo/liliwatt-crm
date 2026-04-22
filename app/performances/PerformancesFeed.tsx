'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';

interface TeamActivity {
  id: string;
  type: string;
  amount: number | null;
  courtierNumber: number | null;
  firstName: string | null; // Prénom de l'utilisateur
  createdAt: Date;
}

export default function PerformancesFeed() {
  const [activities, setActivities] = useState<TeamActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadActivities = async () => {
    try {
      const response = await fetch('/api/team-activities');
      if (response.ok) {
        const data = await response.json();
        // Filtrer uniquement SALE et INVOICE
        const filtered = data.activities.filter((a: TeamActivity) =>
          a.type === 'SALE' || a.type === 'INVOICE'
        );
        setActivities(filtered);
      }
    } catch (error) {
      console.error('Erreur chargement activités');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Marquer les performances comme lues + invalider le badge SWR
    fetch('/api/activities/mark-read', { method: 'POST' })
      .then(() => mutate('/api/activities/count-new'))
      .catch(() => {});
    fetch('/api/notifications/mark-all-read', { method: 'POST' }).catch(() => {});

    loadActivities();

    // Rafraîchir la Navbar pour mettre à jour les compteurs
    setTimeout(() => {
      router.refresh();
    }, 500);

    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadActivities, 30000);
    return () => clearInterval(interval);
  }, [router]);

  const getActivityMessage = (activity: TeamActivity) => {
    if (activity.type === 'SALE' && activity.amount) {
      return `a réalisé une vente de ${activity.amount.toLocaleString('fr-FR')} €`;
    } else if (activity.type === 'INVOICE') {
      return `vient de récupérer une facture !`;
    }
    return 'Nouvelle activité';
  };

  const getActivityIcon = (activity: TeamActivity) => {
    if (activity.type === 'SALE') return '💰';
    if (activity.type === 'INVOICE') return '📄';
    return '✨';
  };

  const getActivityColor = (activity: TeamActivity) => {
    if (activity.type === 'SALE') return 'success';
    if (activity.type === 'INVOICE') return 'primary';
    return 'info';
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="text-muted mt-3 mb-0">Chargement des performances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header bg-white">
        <h5 className="mb-0">
          <i className="bi bi-graph-up-arrow me-2"></i>
          Performances de l&apos;entreprise
        </h5>
      </div>
      <div className="card-body">
        {activities.length === 0 ? (
          <div className="text-center text-muted py-5">
            <i className="bi bi-inbox display-4"></i>
            <p className="mt-3 mb-0">Aucune activité pour le moment</p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className={`list-group-item border-0 ${index !== activities.length - 1 ? 'border-bottom' : ''}`}
                style={{
                  animation: index < 3 ? 'fadeIn 0.5s ease-in' : 'none',
                }}
              >
                <div className="d-flex align-items-start">
                  <div
                    className={`me-3 rounded-circle bg-${getActivityColor(activity)} bg-opacity-10 d-flex align-items-center justify-content-center`}
                    style={{ width: '48px', height: '48px', minWidth: '48px', fontSize: '1.5rem' }}
                  >
                    {getActivityIcon(activity)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <div className="flex-grow-1">
                        <span className={`badge bg-${getActivityColor(activity)} me-2`} style={{ fontSize: '0.75rem' }}>
                          {activity.firstName || `N°${activity.courtierNumber}` || 'Anonyme'}
                        </span>
                        <strong className="text-dark">{getActivityMessage(activity)}</strong>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        <i className="bi bi-clock me-1"></i>
                        {new Date(activity.createdAt).toLocaleString('fr-FR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
