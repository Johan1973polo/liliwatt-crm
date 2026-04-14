'use client';

import { useEffect, useState } from 'react';

interface TeamActivity {
  id: string;
  type: string;
  amount: number | null;
  message: string | null;
  createdAt: Date;
}

export default function TeamActivityFeed() {
  const [activities, setActivities] = useState<TeamActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActivities = async () => {
    try {
      const response = await fetch('/api/team-activities');
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
      }
    } catch (error) {
      console.error('Erreur chargement activités');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
    // Auto-refresh toutes les 30 secondes
    const interval = setInterval(loadActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'SALE':
        return '💰';
      case 'INVOICE':
        return '📄';
      default:
        return '⭐';
    }
  };

  const getActivityMessage = (activity: TeamActivity) => {
    if (activity.message) {
      return activity.message;
    }

    const variants = [
      'Un courtier',
      'Un membre de l\'équipe',
      'Un télévendeur',
      'Un commercial',
    ];
    const randomVariant = variants[Math.floor(Math.random() * variants.length)];

    if (activity.type === 'SALE' && activity.amount) {
      return `${randomVariant} a réalisé une vente de ${activity.amount.toLocaleString('fr-FR')} €`;
    } else if (activity.type === 'INVOICE') {
      return `${randomVariant} vient de récupérer une facture !`;
    }

    return activity.message || 'Nouvelle activité';
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

    if (seconds < 60) return 'À l\'instant';
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
    return `Il y a ${Math.floor(seconds / 86400)}j`;
  };

  if (loading) {
    return (
      <div className="card mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">
            <i className="bi bi-activity me-2"></i>
            Fil d&apos;Activité de l&apos;Équipe
          </h5>
        </div>
        <div className="card-body text-center py-4">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-4 border-primary border-2">
      <div className="card-header bg-gradient text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <h5 className="mb-0">
          <i className="bi bi-activity me-2"></i>
          Fil d&apos;Activité de l&apos;Équipe
        </h5>
        <small className="opacity-75">
          <i className="bi bi-arrow-clockwise me-1"></i>
          Actualisation automatique toutes les 30s
        </small>
      </div>
      <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {activities.length === 0 ? (
          <div className="text-center text-muted py-4">
            <i className="bi bi-inbox display-4"></i>
            <p className="mt-3 mb-0">Aucune activité pour le moment</p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className="list-group-item border-0 px-0"
                style={{
                  animation: index === 0 ? 'slideIn 0.5s ease-out' : 'none',
                }}
              >
                <div className="d-flex align-items-start">
                  <div className="me-3" style={{ fontSize: '2rem' }}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-grow-1">
                    <p className="mb-1 fw-semibold">
                      {getActivityMessage(activity)}
                    </p>
                    <small className="text-muted">
                      <i className="bi bi-clock me-1"></i>
                      {getTimeAgo(activity.createdAt)}
                    </small>
                  </div>
                  {activity.type === 'SALE' && (
                    <div className="badge bg-success-subtle text-success-emphasis fs-6 px-3 py-2">
                      🎯
                    </div>
                  )}
                  {activity.type === 'INVOICE' && (
                    <div className="badge bg-primary-subtle text-primary-emphasis fs-6 px-3 py-2">
                      ✅
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
