'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ModuleCardProps {
  module: {
    id: string;
    title: string;
    description: string;
    order: number;
    icon: string;
    durationEstimated: number;
    status: string;
    unlockedBy: string | null;
    unlockedAt: Date | null | undefined;
    startedAt: Date | null | undefined;
    completedAt: Date | null | undefined;
    score: number | null | undefined;
  };
}

export default function ModuleCard({ module }: ModuleCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const getStatusBadge = () => {
    switch (module.status) {
      case 'LOCKED':
        return (
          <span className="badge bg-secondary">
            <i className="bi bi-lock-fill me-1"></i>
            Verrouillé
          </span>
        );
      case 'UNLOCKED':
        return (
          <span className="badge bg-success">
            <i className="bi bi-unlock-fill me-1"></i>
            Déverrouillé
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="badge bg-warning text-dark">
            <i className="bi bi-hourglass-split me-1"></i>
            En cours
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="badge bg-primary">
            <i className="bi bi-check-circle-fill me-1"></i>
            Complété
          </span>
        );
      default:
        return null;
    }
  };

  const getActionButton = () => {
    if (module.status === 'LOCKED') {
      return (
        <button className="btn btn-secondary w-100" disabled>
          <i className="bi bi-lock-fill me-2"></i>
          Module verrouillé
        </button>
      );
    }

    if (module.status === 'UNLOCKED') {
      return (
        <Link href={`/formation/${module.id}`} className="btn btn-success w-100">
          <i className="bi bi-play-circle me-2"></i>
          Commencer
        </Link>
      );
    }

    if (module.status === 'IN_PROGRESS') {
      return (
        <Link href={`/formation/${module.id}`} className="btn btn-warning w-100">
          <i className="bi bi-arrow-right-circle me-2"></i>
          Reprendre
        </Link>
      );
    }

    if (module.status === 'COMPLETED') {
      return (
        <div>
          <Link href={`/formation/${module.id}`} className="btn btn-outline-primary w-100 mb-2">
            <i className="bi bi-eye me-2"></i>
            Revoir le contenu
          </Link>
          {module.score !== null && (
            <div className="text-center">
              <span className="badge bg-info">
                <i className="bi bi-star-fill me-1"></i>
                Score: {module.score}/100
              </span>
            </div>
          )}
        </div>
      );
    }
  };

  const handleMarkComplete = async () => {
    if (module.status !== 'IN_PROGRESS') return;

    const confirmed = confirm('Êtes-vous sûr d\'avoir terminé ce module ?');
    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch('/api/training/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: module.id,
          status: 'COMPLETED',
        }),
      });

      if (response.ok) {
        alert('✅ Module marqué comme complété !');
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      alert('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card h-100 shadow-sm">
      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        <div>
          <i className={`bi ${module.icon} fs-4 me-2 text-primary`}></i>
          <span className="badge bg-light text-dark">Module {module.order}</span>
        </div>
        {getStatusBadge()}
      </div>

      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{module.title}</h5>
        <p className="card-text text-muted flex-grow-1">{module.description}</p>

        <div className="mb-3">
          <small className="text-muted">
            <i className="bi bi-clock me-1"></i>
            Durée estimée: {module.durationEstimated} min
          </small>
        </div>

        {module.unlockedBy && (
          <div className="alert alert-light py-2 mb-3">
            <small>
              <i className="bi bi-unlock me-1"></i>
              Déverrouillé par <strong>{module.unlockedBy}</strong>
              {module.unlockedAt && (
                <span className="text-muted d-block">
                  le {new Date(module.unlockedAt).toLocaleDateString('fr-FR')}
                </span>
              )}
            </small>
          </div>
        )}

        {module.status === 'IN_PROGRESS' && (
          <button
            onClick={handleMarkComplete}
            className="btn btn-outline-success w-100 mb-2"
            disabled={loading}
          >
            <i className="bi bi-check2-circle me-2"></i>
            {loading ? 'Traitement...' : 'Marquer comme terminé'}
          </button>
        )}

        {getActionButton()}
      </div>

      {module.completedAt && (
        <div className="card-footer bg-light text-center">
          <small className="text-success">
            <i className="bi bi-check-circle-fill me-1"></i>
            Complété le {new Date(module.completedAt).toLocaleDateString('fr-FR')}
          </small>
        </div>
      )}
    </div>
  );
}
