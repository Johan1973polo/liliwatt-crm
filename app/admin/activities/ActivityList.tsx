'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TeamActivity {
  id: string;
  type: string;
  amount: number | null;
  message: string | null;
  isManual: boolean;
  createdAt: Date;
}

export default function ActivityList({
  initialActivities,
}: {
  initialActivities: TeamActivity[];
}) {
  const router = useRouter();
  const [activities, setActivities] = useState(initialActivities);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const confirmed = confirm(
      'Êtes-vous sûr de vouloir supprimer cette activité ?'
    );
    if (!confirmed) return;

    setDeletingId(id);

    try {
      const response = await fetch(`/api/team-activities?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setActivities(activities.filter((a) => a.id !== id));
        router.refresh();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      alert('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const getActivityDisplay = (activity: TeamActivity) => {
    if (activity.message) return activity.message;

    if (activity.type === 'SALE' && activity.amount) {
      return `Un courtier a réalisé une vente de ${activity.amount.toLocaleString('fr-FR')} €`;
    } else if (activity.type === 'INVOICE') {
      return 'Un courtier vient de récupérer une facture !';
    }
    return 'Activité';
  };

  const getActivityIcon = (activity: TeamActivity) => {
    if (activity.type === 'SALE') return '💰';
    if (activity.type === 'INVOICE') return '📄';
    return '✨';
  };

  const getActivityBadge = (activity: TeamActivity) => {
    if (activity.isManual) {
      return (
        <span className="badge bg-warning text-dark ms-2">
          <i className="bi bi-pencil me-1"></i>
          Fictive
        </span>
      );
    }
    return (
      <span className="badge bg-success ms-2">
        <i className="bi bi-check-circle me-1"></i>
        Réelle
      </span>
    );
  };

  return (
    <div className="card">
      <div className="card-header bg-white">
        <h5 className="mb-0">
          <i className="bi bi-list-ul me-2"></i>
          Activités récentes
          <span className="badge bg-primary ms-2">{activities.length}</span>
        </h5>
      </div>
      <div className="card-body">
        {activities.length === 0 ? (
          <div className="text-center text-muted py-4">
            <i className="bi bi-inbox display-4"></i>
            <p className="mt-3">Aucune activité pour le moment</p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="list-group-item d-flex justify-content-between align-items-start"
              >
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-2">
                    <span className="me-2" style={{ fontSize: '1.5rem' }}>
                      {getActivityIcon(activity)}
                    </span>
                    <strong>{getActivityDisplay(activity)}</strong>
                    {getActivityBadge(activity)}
                  </div>
                  <small className="text-muted">
                    <i className="bi bi-clock me-1"></i>
                    {new Date(activity.createdAt).toLocaleString('fr-FR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </small>
                </div>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(activity.id)}
                  disabled={deletingId === activity.id}
                  title="Supprimer cette activité"
                >
                  {deletingId === activity.id ? (
                    <i className="bi bi-hourglass-split"></i>
                  ) : (
                    <i className="bi bi-trash"></i>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
