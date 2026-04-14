'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Availability {
  id: string;
  date: Date;
  slotsJson: string;
}

export default function AvailabilityBlock({ availabilities }: { availabilities: Availability[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState({
    morning: false,
    afternoon: false,
    evening: false,
  });

  const handleSubmit = async () => {
    if (!selectedDate) {
      alert('Veuillez sélectionner une date');
      return;
    }

    if (!slots.morning && !slots.afternoon && !slots.evening) {
      alert('Veuillez sélectionner au moins un créneau');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/availabilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          slots,
        }),
      });

      if (response.ok) {
        setSelectedDate('');
        setSlots({ morning: false, afternoon: false, evening: false });
        alert('Disponibilité enregistrée avec succès');
        router.refresh();
      } else {
        alert('Erreur lors de l&apos;enregistrement');
      }
    } catch (error) {
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const parseSlots = (slotsJson: string) => {
    try {
      return JSON.parse(slotsJson);
    } catch {
      return { morning: false, afternoon: false, evening: false };
    }
  };

  const handleTodayAvailability = async () => {
    setLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const allDaySlots = {
        morning: true,
        afternoon: true,
        evening: true,
      };

      const response = await fetch('/api/availabilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today,
          slots: allDaySlots,
        }),
      });

      if (response.ok) {
        alert('✅ Vous êtes maintenant marqué comme disponible aujourd\'hui');
        router.refresh();
      } else {
        alert('Erreur lors de l&apos;enregistrement');
      }
    } catch (error) {
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header bg-white">
        <h5 className="mb-0">
          <i className="bi bi-calendar-check me-2"></i>
          Mes disponibilités
        </h5>
      </div>
      <div className="card-body">
        {/* Bouton principal "Je suis dispo aujourd'hui" */}
        <div className="mb-4">
          <div className="alert alert-info mb-3">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Première chose à faire chaque jour :</strong> Cliquez sur le bouton ci-dessous pour signaler votre disponibilité.
          </div>
          <button
            onClick={handleTodayAvailability}
            className="btn btn-success btn-lg w-100"
            disabled={loading}
            style={{ fontSize: '1.2rem', padding: '1rem' }}
          >
            <i className="bi bi-check-circle-fill me-2"></i>
            {loading ? 'Enregistrement...' : 'Je suis disponible aujourd\'hui'}
          </button>
        </div>

        {/* Historique */}
        <div className="border-top pt-4">
          <h6 className="mb-3">
            <i className="bi bi-clock-history me-2"></i>
            Historique (7 derniers jours)
          </h6>
          {availabilities.length === 0 ? (
            <div className="text-center text-muted py-3">
              <i className="bi bi-inbox display-6 d-block mb-2"></i>
              <p className="mb-0 small">Aucune disponibilité enregistrée récemment.</p>
            </div>
          ) : (
            <div className="list-group">
              {availabilities.map((avail) => {
                return (
                  <div key={avail.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-semibold">
                          <i className="bi bi-calendar-check text-success me-2"></i>
                          {formatDate(avail.date)}
                        </div>
                      </div>
                      <span className="badge bg-success">
                        <i className="bi bi-check-circle me-1"></i>
                        Disponible
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
