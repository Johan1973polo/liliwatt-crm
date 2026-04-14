'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Vendeur {
  id: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  isActive: boolean;
  isAvailable: boolean | null;
  availabilityHistory: Array<{ date: Date; slotsJson: string }>;
}

interface Slots {
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
}

export default function VendeursTableau({ vendeurs: initialVendeurs }: { vendeurs: Vendeur[] }) {
  const router = useRouter();
  const [vendeurs, setVendeurs] = useState(initialVendeurs);

  useEffect(() => {
    // Auto-refresh toutes les 30 secondes pour voir les nouvelles dispos
    const interval = setInterval(() => {
      router.refresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    setVendeurs(initialVendeurs);
  }, [initialVendeurs]);

  const parseSlots = (slotsJson: string | null): Slots => {
    if (!slotsJson) {
      return { morning: false, afternoon: false, evening: false };
    }
    try {
      return JSON.parse(slotsJson);
    } catch {
      return { morning: false, afternoon: false, evening: false };
    }
  };

  const isSlotAvailable = (slots: Slots): boolean => {
    return slots.morning || slots.afternoon || slots.evening;
  };

  // Générer les 7 derniers jours
  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const formatDayShort = (date: Date) => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return days[date.getDay()];
  };

  const formatDate = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  const last7Days = getLast7Days();

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
            Actualisation automatique toutes les 30s
          </small>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>
                <i className="bi bi-circle-fill text-success me-2" style={{ fontSize: '0.5rem' }}></i>
                Statut
              </th>
              <th>Statut déclaré</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th style={{ minWidth: '200px' }}>
                <i className="bi bi-calendar-week me-1"></i>
                Historique 7 jours
              </th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendeurs.map((vendeur) => {
              // Déterminer le statut déclaré (3 états)
              const declaredStatus = vendeur.isAvailable === null
                ? { text: 'Aucune déclaration', color: 'secondary', icon: 'bi-question-circle-fill' }
                : vendeur.isAvailable
                ? { text: 'Disponible', color: 'success', icon: 'bi-check-circle-fill' }
                : { text: 'Non disponible', color: 'danger', icon: 'bi-x-circle-fill' };

              // Créer une map de l'historique par date
              const historyMap = new Map();
              vendeur.availabilityHistory.forEach(h => {
                const dateKey = new Date(h.date).toDateString();
                historyMap.set(dateKey, h.slotsJson);
              });

              return (
                <tr key={vendeur.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      {vendeur.isAvailable === true ? (
                        <span className="position-relative">
                          <i className="bi bi-circle-fill text-success" style={{ fontSize: '1rem' }}></i>
                          <span
                            className="position-absolute top-0 start-0 translate-middle p-1 bg-success border border-light rounded-circle"
                            style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                          >
                            <span className="visually-hidden">Disponible</span>
                          </span>
                        </span>
                      ) : vendeur.isAvailable === false ? (
                        <i className="bi bi-circle-fill text-danger" style={{ fontSize: '1rem' }}></i>
                      ) : (
                        <i className="bi bi-circle-fill text-secondary" style={{ fontSize: '1rem' }}></i>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge bg-${declaredStatus.color}`}>
                      <i className={`bi ${declaredStatus.icon} me-1`}></i>
                      {declaredStatus.text}
                    </span>
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
                    {vendeur.phone ? (
                      <a href={`tel:${vendeur.phone}`} className="text-decoration-none">
                        <i className="bi bi-telephone me-1"></i>
                        {vendeur.phone}
                      </a>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-1 align-items-center">
                      {last7Days.map((day, index) => {
                        const dateKey = day.toDateString();
                        const slotsJson = historyMap.get(dateKey);
                        const slots = parseSlots(slotsJson || null);
                        const wasAvailable = isSlotAvailable(slots);

                        const isToday = day.toDateString() === new Date().toDateString();

                        return (
                          <div
                            key={index}
                            className="text-center"
                            title={`${formatDayShort(day)} ${formatDate(day)} - ${wasAvailable ? 'Disponible' : 'Non disponible'}`}
                            style={{ flex: '0 0 auto' }}
                          >
                            <div style={{ fontSize: '0.65rem', color: '#6c757d', fontWeight: isToday ? 'bold' : 'normal' }}>
                              {formatDayShort(day)}
                            </div>
                            <div>
                              {wasAvailable ? (
                                <i className="bi bi-circle-fill text-success" style={{ fontSize: '0.75rem' }}></i>
                              ) : (
                                <i className="bi bi-circle text-muted" style={{ fontSize: '0.75rem' }}></i>
                              )}
                            </div>
                            <div style={{ fontSize: '0.6rem', color: '#6c757d' }}>
                              {formatDate(day).split('/')[0]}
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
      <div className="card-footer bg-white text-muted small">
        <i className="bi bi-info-circle me-1"></i>
        La pastille de statut reflète le statut déclaré par le vendeur. L&apos;historique montre les 7 derniers jours :
        <i className="bi bi-circle-fill text-success mx-1" style={{ fontSize: '0.6rem' }}></i> = disponible,
        <i className="bi bi-circle text-muted mx-1" style={{ fontSize: '0.6rem' }}></i> = non disponible.
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
