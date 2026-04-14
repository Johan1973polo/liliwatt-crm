'use client';

import { useState, useEffect } from 'react';
import { EVENT_TYPE_CONFIG, getAvailableEventTypes } from '@/lib/calendar-types';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  avatar: string | null;
  courtierNumber: number | null;
}

interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  eventType: string;
  color: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  attendeeIds: string;
  user: User;
}

interface CalendarInterfaceProps {
  currentUserId: string;
  currentUserRole: string;
  viewableUsers: User[];
  canEdit?: boolean;
}

export default function CalendarInterface({
  currentUserId,
  currentUserRole,
  viewableUsers,
  canEdit = true,
}: CalendarInterfaceProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(viewableUsers.map(u => u.id));
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ day: Date; hour: number } | null>(null);

  // Charger les événements
  useEffect(() => {
    loadEvents();
  }, [currentWeekStart]);

  async function loadEvents() {
    setLoading(true);
    try {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const response = await fetch(
        `/api/calendar?startDate=${currentWeekStart.toISOString()}&endDate=${weekEnd.toISOString()}`
      );

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    } finally {
      setLoading(false);
    }
  }

  // Navigation semaine
  function previousWeek() {
    const newStart = new Date(Date.UTC(
      currentWeekStart.getUTCFullYear(),
      currentWeekStart.getUTCMonth(),
      currentWeekStart.getUTCDate() - 7,
      0, 0, 0, 0
    ));
    setCurrentWeekStart(newStart);
  }

  function nextWeek() {
    const newStart = new Date(Date.UTC(
      currentWeekStart.getUTCFullYear(),
      currentWeekStart.getUTCMonth(),
      currentWeekStart.getUTCDate() + 7,
      0, 0, 0, 0
    ));
    setCurrentWeekStart(newStart);
  }

  function goToToday() {
    setCurrentWeekStart(getMonday(new Date()));
  }

  // Générer les 7 jours de la semaine
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(currentWeekStart);
    // Créer le jour en UTC pour cohérence avec le reste du système
    const utcDay = new Date(Date.UTC(
      day.getFullYear(),
      day.getMonth(),
      day.getDate() + i,
      0, 0, 0, 0
    ));
    return utcDay;
  });

  // Heures de travail (8h - 20h)
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);

  // Filtrer les événements selon les utilisateurs sélectionnés
  // Inclure aussi les événements où l'utilisateur est participant
  const filteredEvents = events.filter(event => {
    // Vérifier si l'utilisateur est le propriétaire
    if (selectedUsers.includes(event.userId)) {
      return true;
    }
    // Vérifier si l'utilisateur est dans les participants
    try {
      const attendeeIds = JSON.parse(event.attendeeIds || '[]');
      return attendeeIds.some((id: string) => selectedUsers.includes(id));
    } catch {
      return false;
    }
  });

  // Ouvrir le modal pour créer un événement
  function handleSlotClick(day: Date, hour: number) {
    if (!canEdit) return; // Empêcher la création si en lecture seule
    setSelectedSlot({ day, hour });
    setSelectedEvent(null);
    setShowEventModal(true);
  }

  // Ouvrir le modal pour éditer un événement
  function handleEventClick(event: CalendarEvent) {
    if (!canEdit) return; // Empêcher l'édition si en lecture seule
    setSelectedEvent(event);
    setSelectedSlot(null);
    setShowEventModal(true);
  }

  // Obtenir les événements qui COMMENCENT à ce créneau (pour éviter les doublons)
  function getEventsStartingAt(day: Date, hour: number): Array<{ event: CalendarEvent; height: number }> {
    return filteredEvents
      .filter(event => {
        const eventStart = new Date(event.startTime);

        // Comparer tout en UTC pour cohérence totale
        return (
          eventStart.getUTCDate() === day.getUTCDate() &&
          eventStart.getUTCMonth() === day.getUTCMonth() &&
          eventStart.getUTCFullYear() === day.getUTCFullYear() &&
          eventStart.getUTCHours() === hour
        );
      })
      .map(event => {
        // Calculer la hauteur en fonction de la durée
        const eventStart = new Date(event.startTime);
        const eventEnd = new Date(event.endTime);
        const durationMs = eventEnd.getTime() - eventStart.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        const height = Math.max(1, durationHours) * 60; // 60px par heure
        return { event, height };
      });
  }

  // Toggle user filter
  function toggleUserFilter(userId: string) {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }

  // Vérifier si l'utilisateur peut éditer un événement
  function canEditEvent(event: CalendarEvent): boolean {
    if (currentUserRole === 'ADMIN') return true;
    if (event.userId === currentUserId) return true;
    if (currentUserRole === 'REFERENT') {
      const eventUser = viewableUsers.find(u => u.id === event.userId);
      return eventUser?.role === 'VENDEUR';
    }
    return false;
  }

  return (
    <div className="row">
      {/* Filtres utilisateurs */}
      <div className="col-md-3 mb-4">
        <div className="card">
          <div className="card-header bg-white">
            <h6 className="mb-0">
              <i className="bi bi-funnel me-2"></i>
              Filtrer par personne
            </h6>
          </div>
          <div className="card-body">
            {/* Boutons de filtrage rapide */}
            <div className="mb-3">
              <div className="d-flex flex-column gap-2">
                <button
                  className="btn btn-sm btn-primary w-100"
                  onClick={() => setSelectedUsers([currentUserId])}
                >
                  <i className="bi bi-person-fill me-1"></i>
                  Mon agenda uniquement
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary w-100"
                  onClick={() => setSelectedUsers(viewableUsers.map(u => u.id))}
                >
                  <i className="bi bi-people-fill me-1"></i>
                  Tout afficher
                </button>
              </div>

              {/* Boutons rapides pour chaque vendeur */}
              {viewableUsers.filter(u => u.role === 'VENDEUR' && u.id !== currentUserId).length > 0 && (
                <div className="mt-3">
                  <small className="text-muted d-block mb-2">Accès rapide vendeurs :</small>
                  <div className="d-flex flex-column gap-1">
                    {viewableUsers
                      .filter(u => u.role === 'VENDEUR' && u.id !== currentUserId)
                      .map(vendeur => {
                        const vendeurName = vendeur.firstName && vendeur.lastName
                          ? `${vendeur.firstName} ${vendeur.lastName}`
                          : vendeur.email;
                        return (
                          <button
                            key={vendeur.id}
                            className="btn btn-sm btn-outline-info w-100 text-start"
                            onClick={() => setSelectedUsers([vendeur.id])}
                          >
                            <i className="bi bi-calendar-check me-1"></i>
                            {vendeurName}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            <hr className="my-3" />

            {/* Filtres manuels par checkbox */}
            <small className="text-muted d-block mb-2">Sélection manuelle :</small>
            <div className="d-flex flex-column gap-2">
              {viewableUsers.map(user => {
                const isSelected = selectedUsers.includes(user.id);
                const userName = user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.email;
                const isCurrentUser = user.id === currentUserId;

                return (
                  <div key={user.id} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`user-${user.id}`}
                      checked={isSelected}
                      onChange={() => toggleUserFilter(user.id)}
                    />
                    <label className="form-check-label" htmlFor={`user-${user.id}`}>
                      <span className={isCurrentUser ? 'fw-bold' : ''}>
                        {userName}
                        {isCurrentUser && ' (Moi)'}
                      </span>
                      <br />
                      <small className="text-muted">{user.role}</small>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card mt-3">
          <div className="card-header bg-white">
            <h6 className="mb-0">
              <i className="bi bi-info-circle me-2"></i>
              Légende
            </h6>
          </div>
          <div className="card-body">
            <div className="d-flex flex-column gap-2">
              {getAvailableEventTypes(currentUserRole).map(eventType => {
                const config = EVENT_TYPE_CONFIG[eventType];
                return (
                  <div key={eventType} className="d-flex align-items-center gap-2">
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: config.color,
                        borderRadius: '3px',
                      }}
                    ></div>
                    <small>{config.label}</small>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Calendrier */}
      <div className="col-md-9">
        <div className="card">
          <div className="card-header bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <div className="btn-group">
                <button className="btn btn-sm btn-outline-secondary" onClick={previousWeek}>
                  <i className="bi bi-chevron-left"></i>
                </button>
                <button className="btn btn-sm btn-outline-secondary" onClick={goToToday}>
                  Aujourd&apos;hui
                </button>
                <button className="btn btn-sm btn-outline-secondary" onClick={nextWeek}>
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
              <h6 className="mb-0">
                {formatWeekRange(currentWeekStart)}
              </h6>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  setSelectedSlot({ day: new Date(), hour: 9 });
                  setSelectedEvent(null);
                  setShowEventModal(true);
                }}
              >
                <i className="bi bi-plus-lg me-1"></i>
                Nouvel événement
              </button>
            </div>
          </div>

          <div className="card-body p-0" style={{ overflowX: 'auto' }}>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
              </div>
            ) : (
              <table className="table table-bordered mb-0" style={{ minWidth: '900px' }}>
                <thead>
                  <tr>
                    <th style={{ width: '80px', position: 'sticky', left: 0, backgroundColor: '#fff', zIndex: 1 }}>
                      Heure
                    </th>
                    {weekDays.map((day, index) => (
                      <th key={index} className="text-center" style={{ minWidth: '120px' }}>
                        <div className="fw-bold">{formatDayName(day)}</div>
                        <div className="text-muted small">{formatDate(day)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hours.map(hour => (
                    <tr key={hour}>
                      <td
                        className="text-center align-middle fw-bold"
                        style={{
                          position: 'sticky',
                          left: 0,
                          backgroundColor: '#fff',
                          zIndex: 1,
                        }}
                      >
                        {hour}:00
                      </td>
                      {weekDays.map((day, dayIndex) => {
                        const eventsStartingHere = getEventsStartingAt(day, hour);
                        return (
                          <td
                            key={dayIndex}
                            className="p-1 position-relative"
                            style={{
                              height: '60px',
                              cursor: canEdit ? 'pointer' : 'default',
                              backgroundColor: isToday(day) ? '#f0f9ff' : '#fff',
                            }}
                            onClick={() => handleSlotClick(day, hour)}
                          >
                            {eventsStartingHere.map(({ event, height }) => {
                              const config = EVENT_TYPE_CONFIG[event.eventType as keyof typeof EVENT_TYPE_CONFIG];

                              // Obtenir le nom de l'organisateur
                              const organizerName = event.user.firstName && event.user.lastName
                                ? `${event.user.firstName} ${event.user.lastName}`
                                : event.user.email;

                              // Obtenir les noms des participants
                              let attendeeNames: string[] = [];
                              try {
                                const attendeeIds = JSON.parse(event.attendeeIds || '[]');
                                attendeeNames = attendeeIds
                                  .map((id: string) => {
                                    const user = viewableUsers.find(u => u.id === id);
                                    if (!user) return null;
                                    return user.firstName && user.lastName
                                      ? `${user.firstName} ${user.lastName}`
                                      : user.email;
                                  })
                                  .filter(Boolean);
                              } catch {}

                              // Construire le tooltip avec tous les détails
                              const tooltipLines = [
                                `📅 ${event.title}`,
                                `Organisateur: ${organizerName}`,
                              ];

                              if (attendeeNames.length > 0) {
                                tooltipLines.push(`\nParticipants conviés:`);
                                attendeeNames.forEach(name => tooltipLines.push(`  • ${name}`));
                              }

                              const tooltip = tooltipLines.join('\n');

                              return (
                                <div
                                  key={event.id}
                                  className="p-2 rounded text-white small position-absolute"
                                  style={{
                                    backgroundColor: event.color,
                                    fontSize: '0.75rem',
                                    cursor: canEdit && canEditEvent(event) ? 'pointer' : 'default',
                                    height: `${height - 4}px`,
                                    width: 'calc(100% - 8px)',
                                    top: '2px',
                                    left: '4px',
                                    overflow: 'hidden',
                                    zIndex: 10,
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (canEdit && canEditEvent(event)) {
                                      handleEventClick(event);
                                    }
                                  }}
                                  title={tooltip}
                                >
                                  <div className="fw-bold mb-1" style={{ fontSize: '0.7rem' }}>
                                    <i className={`bi ${config?.icon || 'bi-calendar-event'} me-1`}></i>
                                    {event.title}
                                  </div>
                                  <div className="small" style={{ fontSize: '0.6rem', opacity: 0.95 }}>
                                    <i className="bi bi-person me-1"></i>
                                    {organizerName}
                                  </div>
                                  {attendeeNames.length > 0 && (
                                    <div className="small mt-1" style={{ fontSize: '0.6rem', opacity: 0.9 }}>
                                      <i className="bi bi-people me-1"></i>
                                      +{attendeeNames.length} invité{attendeeNames.length > 1 ? 's' : ''}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal événement */}
      {showEventModal && (
        <EventModal
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          viewableUsers={viewableUsers}
          event={selectedEvent}
          selectedSlot={selectedSlot}
          onClose={() => setShowEventModal(false)}
          onSave={() => {
            setShowEventModal(false);
            loadEvents();
          }}
        />
      )}
    </div>
  );
}

// Composant Modal pour créer/éditer un événement
function EventModal({
  currentUserId,
  currentUserRole,
  viewableUsers,
  event,
  selectedSlot,
  onClose,
  onSave,
}: {
  currentUserId: string;
  currentUserRole: string;
  viewableUsers: User[];
  event: CalendarEvent | null;
  selectedSlot: { day: Date; hour: number } | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    userId: event?.userId || currentUserId,
    title: event?.title || '',
    description: event?.description || '',
    eventType: event?.eventType || 'AUTRE',
    color: event?.color || '#3b82f6',
    startTime: event?.startTime
      ? toLocalDateTimeString(new Date(event.startTime))
      : (selectedSlot ? getSlotStartTime(selectedSlot.day, selectedSlot.hour) : ''),
    endTime: event?.endTime
      ? toLocalDateTimeString(new Date(event.endTime))
      : (selectedSlot ? getSlotEndTime(selectedSlot.day, selectedSlot.hour) : ''),
    isAllDay: event?.isAllDay || false,
    attendeeIds: event?.attendeeIds || '[]',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>(() => {
    try {
      return JSON.parse(event?.attendeeIds || '[]');
    } catch {
      return [];
    }
  });

  const availableEventTypes = getAvailableEventTypes(currentUserRole);

  // Obtenir les utilisateurs assignables comme participants
  const assignableParticipants = viewableUsers.filter(user => {
    if (currentUserRole === 'ADMIN') {
      // Admin peut assigner vendeurs et référents comme participants
      return user.role === 'VENDEUR' || user.role === 'REFERENT';
    } else if (currentUserRole === 'REFERENT') {
      // Référent peut assigner ses vendeurs
      return user.role === 'VENDEUR';
    }
    return false;
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const url = event ? `/api/calendar/${event.id}` : '/api/calendar';
      const method = event ? 'PUT' : 'POST';

      // Préparer les données avec les participants et conversion des dates en UTC
      const dataToSend = {
        ...formData,
        startTime: parseLocalDateTime(formData.startTime),
        endTime: parseLocalDateTime(formData.endTime),
        attendeeIds: JSON.stringify(selectedAttendees),
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        onSave();
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  }

  // Toggle selection d'un participant
  function toggleAttendee(userId: string) {
    setSelectedAttendees(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  }

  async function handleDelete() {
    if (!event || !confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/calendar/${event.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onSave();
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  }

  // Mettre à jour la couleur quand le type change
  useEffect(() => {
    const config = EVENT_TYPE_CONFIG[formData.eventType as keyof typeof EVENT_TYPE_CONFIG];
    if (config) {
      setFormData(prev => ({ ...prev, color: config.color }));
    }
  }, [formData.eventType]);

  // Mettre à jour les heures quand "journée entière" est coché
  useEffect(() => {
    if (formData.isAllDay && formData.startTime) {
      // Parser la date actuelle depuis le datetime-local (format: YYYY-MM-DDTHH:mm)
      const [datePart] = formData.startTime.split('T');
      const [year, month, day] = datePart.split('-').map(Number);

      // Créer les nouvelles heures (8h-20h) en UTC
      const startDate = new Date(Date.UTC(year, month - 1, day, 8, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, month - 1, day, 20, 0, 0, 0));

      setFormData(prev => ({
        ...prev,
        startTime: toLocalDateTimeString(startDate),
        endTime: toLocalDateTimeString(endDate),
      }));
    }
  }, [formData.isAllDay]);

  // Déterminer les utilisateurs assignables (pour qui créer l'événement)
  const assignableUsers = viewableUsers.filter(user => {
    if (currentUserRole === 'ADMIN') return true;
    if (user.id === currentUserId) return true;
    if (currentUserRole === 'REFERENT') {
      // Référent peut assigner à: lui-même, ses vendeurs, les admins, les autres référents
      return user.role === 'VENDEUR' || user.role === 'ADMIN' || user.role === 'REFERENT';
    }
    return false;
  });

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">
                {event ? 'Modifier l\'événement' : 'Nouvel événement'}
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              {/* Assignation */}
              {assignableUsers.length > 1 && (
                <div className="mb-3">
                  <label className="form-label">Assigner à</label>
                  <select
                    className="form-select"
                    value={formData.userId}
                    onChange={e => setFormData({ ...formData, userId: e.target.value })}
                    required
                  >
                    {assignableUsers.map(user => {
                      const userName = user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.email;
                      return (
                        <option key={user.id} value={user.id}>
                          {userName} {user.id === currentUserId ? '(Moi)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Titre */}
              <div className="mb-3">
                <label className="form-label">Titre *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Type */}
              <div className="mb-3">
                <label className="form-label">Type *</label>
                <select
                  className="form-select"
                  value={formData.eventType}
                  onChange={e => setFormData({ ...formData, eventType: e.target.value })}
                  required
                >
                  {availableEventTypes.map(type => {
                    const config = EVENT_TYPE_CONFIG[type];
                    return (
                      <option key={type} value={type}>
                        {config.label}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Dates/Heures */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Début *</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Fin *</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Sélection des participants (pour référent/admin) - TOUS les événements */}
              {(currentUserRole === 'REFERENT' || currentUserRole === 'ADMIN') &&
                assignableParticipants.length > 0 && (
                <div className="mb-3">
                  <label className="form-label">
                    <i className="bi bi-people me-1"></i>
                    Ajouter des participants
                  </label>
                  <div className="border rounded p-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {assignableParticipants.map(participant => {
                      const isSelected = selectedAttendees.includes(participant.id);
                      const participantName = participant.firstName && participant.lastName
                        ? `${participant.firstName} ${participant.lastName}`
                        : participant.email;
                      const roleLabel = participant.role === 'VENDEUR' ? 'Vendeur' : 'Référent';
                      return (
                        <div key={participant.id} className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`attendee-${participant.id}`}
                            checked={isSelected}
                            onChange={() => toggleAttendee(participant.id)}
                          />
                          <label className="form-check-label" htmlFor={`attendee-${participant.id}`}>
                            {participantName} <small className="text-muted">({roleLabel})</small>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  <small className="text-muted">
                    Ces utilisateurs verront l&apos;événement dans leur agenda et pourront voir qui d&apos;autre est convié
                  </small>
                </div>
              )}

              {/* Affichage liste complète participants (pour tous si événement existant avec participants) */}
              {event && selectedAttendees.length > 0 && (
                <div className="mb-3">
                  <label className="form-label">
                    <i className="bi bi-people-fill me-1 text-primary"></i>
                    Participants conviés à cet événement
                  </label>
                  <div className="border rounded p-3 bg-light">
                    {/* Organisateur */}
                    <div className="mb-2 pb-2 border-bottom">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-star-fill text-warning me-2"></i>
                        <strong>Organisateur:</strong>
                      </div>
                      <div className="ms-4 mt-1">
                        {event.user.firstName && event.user.lastName
                          ? `${event.user.firstName} ${event.user.lastName}`
                          : event.user.email}
                        {' '}
                        <small className="text-muted">
                          ({event.user.role === 'ADMIN' ? 'Admin' : event.user.role === 'REFERENT' ? 'Référent' : 'Vendeur'})
                        </small>
                      </div>
                    </div>
                    {/* Participants */}
                    <div className="mt-2">
                      <div className="mb-1"><strong>Participants invités:</strong></div>
                      {selectedAttendees.map(attendeeId => {
                        const participant = viewableUsers.find(u => u.id === attendeeId);
                        if (!participant) return null;
                        const participantName = participant.firstName && participant.lastName
                          ? `${participant.firstName} ${participant.lastName}`
                          : participant.email;
                        const roleLabel = participant.role === 'VENDEUR' ? 'Vendeur' : participant.role === 'REFERENT' ? 'Référent' : 'Admin';
                        return (
                          <div key={attendeeId} className="d-flex align-items-center ms-3 mb-1">
                            <i className="bi bi-person-check-fill text-success me-2"></i>
                            <span>{participantName} <small className="text-muted">({roleLabel})</small></span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Journée entière */}
              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="isAllDay"
                  checked={formData.isAllDay}
                  onChange={e => setFormData({ ...formData, isAllDay: e.target.checked })}
                />
                <label className="form-check-label" htmlFor="isAllDay">
                  Journée entière
                </label>
              </div>
            </div>

            <div className="modal-footer">
              {event && (
                <button
                  type="button"
                  className="btn btn-danger me-auto"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Suppression...' : 'Supprimer'}
                </button>
              )}
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Annuler
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Fonctions utilitaires
function getMonday(date: Date): Date {
  const d = new Date(date);
  // Utiliser UTC pour cohérence
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff, 0, 0, 0, 0));
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(Date.UTC(
    weekStart.getUTCFullYear(),
    weekStart.getUTCMonth(),
    weekStart.getUTCDate() + 6,
    0, 0, 0, 0
  ));

  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' };
  return `${weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' })} - ${weekEnd.toLocaleDateString('fr-FR', options)}`;
}

function formatDayName(date: Date): string {
  return date.toLocaleDateString('fr-FR', { weekday: 'short', timeZone: 'UTC' }).toUpperCase();
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric', timeZone: 'UTC' });
}

function isToday(date: Date): boolean {
  const today = new Date();
  // Comparer en UTC pour cohérence avec le reste du calendrier
  return (
    date.getUTCDate() === today.getUTCDate() &&
    date.getUTCMonth() === today.getUTCMonth() &&
    date.getUTCFullYear() === today.getUTCFullYear()
  );
}

// Convertir une date en format datetime-local (YYYY-MM-DDTHH:mm)
// Utilise UTC pour éviter les conversions de fuseau horaire
function toLocalDateTimeString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Parser une string datetime-local en Date UTC (évite les conversions de timezone)
function parseLocalDateTime(dateTimeLocalString: string): string {
  const [datePart, timePart] = dateTimeLocalString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
  return date.toISOString();
}

function getSlotStartTime(day: Date, hour: number): string {
  const d = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), hour, 0, 0, 0));
  return toLocalDateTimeString(d);
}

function getSlotEndTime(day: Date, hour: number): string {
  const d = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), hour + 1, 0, 0, 0));
  return toLocalDateTimeString(d);
}
