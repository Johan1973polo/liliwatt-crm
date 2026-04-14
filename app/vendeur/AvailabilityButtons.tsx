'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AvailabilityButtonsProps {
  initialAvailability: boolean | null;
}

export default function AvailabilityButtons({ initialAvailability }: AvailabilityButtonsProps) {
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState<boolean | null>(initialAvailability);
  const [loading, setLoading] = useState(false);

  const handleSetAvailable = async (newStatus: boolean) => {
    setLoading(true);

    try {
      const response = await fetch('/api/availability/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsAvailable(data.isAvailable);
        router.refresh();
      } else {
        alert('Erreur lors du changement de disponibilité');
      }
    } catch (error) {
      alert('Erreur lors du changement de disponibilité');
    } finally {
      setLoading(false);
    }
  };

  // Déterminer le statut actuel (3 états: null, true, false)
  const statusText = isAvailable === null
    ? 'Aucun statut déclaré'
    : isAvailable
    ? 'Disponible'
    : 'Non disponible';

  const statusColor = isAvailable === null
    ? 'secondary'
    : isAvailable
    ? 'success'
    : 'danger';

  const statusIcon = isAvailable === null
    ? 'bi-question-circle-fill'
    : isAvailable
    ? 'bi-check-circle-fill'
    : 'bi-x-circle-fill';

  return (
    <div>
      {/* Affichage du statut actuel */}
      <div className="alert alert-light border mb-3 text-center">
        <small className="text-muted d-block mb-1">Statut actuel</small>
        <span className={`badge bg-${statusColor} fs-6`}>
          <i className={`bi ${statusIcon} me-2`}></i>
          {statusText}
        </span>
      </div>

      {/* 2 boutons séparés */}
      <div className="row g-2">
        <div className="col-6">
          <button
            onClick={() => handleSetAvailable(true)}
            disabled={loading || isAvailable === true}
            className={`btn btn-success w-100 ${isAvailable === true ? 'active' : ''}`}
            style={{
              fontSize: '0.95rem',
              fontWeight: 'bold',
              opacity: isAvailable === true ? 1 : 0.7
            }}
          >
            {loading && isAvailable !== true ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : (
              <i className="bi bi-check-circle-fill me-2"></i>
            )}
            Je suis disponible
          </button>
        </div>
        <div className="col-6">
          <button
            onClick={() => handleSetAvailable(false)}
            disabled={loading || isAvailable === false}
            className={`btn btn-danger w-100 ${isAvailable === false ? 'active' : ''}`}
            style={{
              fontSize: '0.95rem',
              fontWeight: 'bold',
              opacity: isAvailable === false ? 1 : 0.7
            }}
          >
            {loading && isAvailable !== false ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : (
              <i className="bi bi-x-circle-fill me-2"></i>
            )}
            Non disponible
          </button>
        </div>
      </div>

      <small className="text-muted d-block mt-2 text-center">
        {isAvailable === true ? 'Disponibilité enregistrée ✓' : isAvailable === false ? 'Vous n\'êtes plus disponible' : 'Veuillez indiquer votre disponibilité'}
      </small>
    </div>
  );
}
