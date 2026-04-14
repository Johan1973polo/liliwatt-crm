'use client';

import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  kind: string;
  entityId: string;
  isRead: boolean;
  metadata: string | null;
  createdAt: Date;
}

interface Request {
  id: string;
  type: string;
  status: string;
  payloadJson: string;
  createdAt: Date;
  user: { email: string };
  referent: { email: string };
}

interface Message {
  id: string;
  body: string;
  createdAt: Date;
  from: { email: string };
  to: { email: string };
}

export default function NotificationsList({
  notifications,
  requests,
  messages,
}: {
  notifications: Notification[];
  requests: Request[];
  messages: Message[];
}) {
  const router = useRouter();

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      router.refresh();
    } catch (error) {
      console.error('Erreur lors du marquage:', error);
    }
  };

  const getRequestLabel = (type: string) => {
    switch (type) {
      case 'DATA_BASE':
        return 'Demande de base télépro';
      case 'FINANCIAL_RATING':
        return 'Demande de note financière';
      default:
        return 'Demande';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="card">
      <div className="card-body">
        {notifications.length === 0 ? (
          <p className="text-muted mb-0">Aucune notification pour le moment.</p>
        ) : (
          <div className="list-group list-group-flush">
            {notifications.map((notif) => {
              if (notif.kind === 'REQUEST') {
                const request = requests.find((r) => r.id === notif.entityId);
                if (!request) return null;

                const payload = JSON.parse(request.payloadJson);

                return (
                  <div
                    key={notif.id}
                    className={`list-group-item ${!notif.isRead ? 'bg-light' : ''}`}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-envelope-paper text-primary me-2"></i>
                          <h6 className="mb-0">{getRequestLabel(request.type)}</h6>
                          {!notif.isRead && (
                            <span className="badge bg-danger ms-2">Nouveau</span>
                          )}
                        </div>
                        <p className="text-muted mb-1">
                          <strong>De:</strong> {request.user.email}
                        </p>
                        <p className="text-muted mb-1">
                          <strong>Assigné à:</strong> {request.referent.email}
                        </p>
                        <div className="mb-2">
                          {request.type === 'DATA_BASE' && (
                            <p className="mb-0">
                              <strong>Description:</strong> {payload.description}
                            </p>
                          )}
                          {request.type === 'FINANCIAL_RATING' && (
                            <>
                              <p className="mb-0">
                                <strong>SIREN:</strong> {payload.siren}
                              </p>
                              <p className="mb-0">
                                <strong>Raison sociale:</strong> {payload.raisonSociale}
                              </p>
                              {payload.commentaire && (
                                <p className="mb-0">
                                  <strong>Commentaire:</strong> {payload.commentaire}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                        <p className="text-muted small mb-0">
                          <i className="bi bi-clock me-1"></i>
                          {formatDate(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="bi bi-check2"></i> Marquer lu
                        </button>
                      )}
                    </div>
                  </div>
                );
              } else if (notif.kind === 'MESSAGE') {
                const message = messages.find((m) => m.id === notif.entityId);
                if (!message) return null;

                return (
                  <div
                    key={notif.id}
                    className={`list-group-item ${!notif.isRead ? 'bg-light' : ''}`}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-chat-dots text-info me-2"></i>
                          <h6 className="mb-0">Nouveau message</h6>
                          {!notif.isRead && (
                            <span className="badge bg-danger ms-2">Nouveau</span>
                          )}
                        </div>
                        <p className="text-muted mb-1">
                          <strong>De:</strong> {message.from.email}
                        </p>
                        <p className="text-muted mb-1">
                          <strong>À:</strong> {message.to.email}
                        </p>
                        <p className="mb-2">{message.body}</p>
                        <p className="text-muted small mb-0">
                          <i className="bi bi-clock me-1"></i>
                          {formatDate(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="bi bi-check2"></i> Marquer lu
                        </button>
                      )}
                    </div>
                  </div>
                );
              } else if (notif.kind === 'INVOICE_RECEIVED') {
                // Annonce de facture récupérée
                if (!notif.metadata) return null;
                const metadata = JSON.parse(notif.metadata);

                return (
                  <div
                    key={notif.id}
                    className="list-group-item"
                    style={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #ffc107' }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-bell-fill text-warning me-2" style={{ fontSize: '1.5rem' }}></i>
                          <h5 className="mb-0 text-warning">🎉 Félicitations !</h5>
                        </div>
                        <p className="mb-2 fw-bold" style={{ fontSize: '1.1rem' }}>
                          {metadata.vendorEmail} vient de récupérer sa facture !
                        </p>
                        <p className="text-muted small mb-0">
                          <i className="bi bi-clock me-1"></i>
                          {formatDate(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="btn btn-sm btn-outline-warning"
                        >
                          <i className="bi bi-check2"></i> Marquer lu
                        </button>
                      )}
                    </div>
                  </div>
                );
              } else if (notif.kind === 'SALE_MADE') {
                // Annonce de vente
                if (!notif.metadata) return null;
                const metadata = JSON.parse(notif.metadata);

                return (
                  <div
                    key={notif.id}
                    className="list-group-item"
                    style={{ background: 'linear-gradient(135deg, #fff9e6 0%, #fffbf0 100%)', borderLeft: '4px solid #ffd700' }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-gem text-warning me-2" style={{ fontSize: '1.5rem' }}></i>
                          <h5 className="mb-0 text-warning">🏆 Félicitations !</h5>
                        </div>
                        <p className="mb-2 fw-bold" style={{ fontSize: '1.1rem' }}>
                          {metadata.vendorEmail} vient de réaliser une vente de <span className="text-success">{metadata.amount}€</span> !
                        </p>
                        <p className="text-muted small mb-0">
                          <i className="bi bi-clock me-1"></i>
                          {formatDate(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="btn btn-sm btn-outline-warning"
                        >
                          <i className="bi bi-check2"></i> Marquer lu
                        </button>
                      )}
                    </div>
                  </div>
                );
              } else if (notif.kind === 'ADMIN_BROADCAST') {
                // Annonce de l'admin à l'équipe
                if (!notif.metadata) return null;
                const metadata = JSON.parse(notif.metadata);

                return (
                  <div
                    key={notif.id}
                    className="list-group-item"
                    style={{ backgroundColor: '#e3f2fd', borderLeft: '4px solid #2196f3' }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-megaphone-fill text-primary me-2" style={{ fontSize: '1.5rem' }}></i>
                          <h5 className="mb-0 text-primary">📢 Annonce de l&apos;administration</h5>
                        </div>
                        <p className="mb-2 fw-bold" style={{ fontSize: '1.1rem' }}>
                          {metadata.message}
                        </p>
                        <p className="text-muted mb-1 small">
                          <strong>De:</strong> {metadata.adminEmail}
                        </p>
                        <p className="text-muted small mb-0">
                          <i className="bi bi-clock me-1"></i>
                          {formatDate(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="bi bi-check2"></i> Marquer lu
                        </button>
                      )}
                    </div>
                  </div>
                );
              } else if (notif.kind === 'CALENDAR_REMINDER') {
                // Rappel d'événements du jour
                if (!notif.metadata) return null;
                const metadata = JSON.parse(notif.metadata);

                return (
                  <div
                    key={notif.id}
                    className={`list-group-item ${!notif.isRead ? 'bg-light' : ''}`}
                    style={{ borderLeft: '4px solid #8b5cf6', cursor: 'pointer' }}
                    onClick={() => {
                      handleMarkAsRead(notif.id);
                      router.push('/calendar');
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-calendar-check text-purple me-2" style={{ fontSize: '1.5rem', color: '#8b5cf6' }}></i>
                          <h6 className="mb-0">📅 Rappel agenda</h6>
                          {!notif.isRead && (
                            <span className="badge bg-danger ms-2">Nouveau</span>
                          )}
                        </div>
                        <p className="mb-2">
                          Vous avez <strong>{metadata.eventCount}</strong> événement{metadata.eventCount > 1 ? 's' : ''} aujourd&apos;hui
                          {metadata.firstEventTime && `, le premier à ${metadata.firstEventTime}`}
                        </p>
                        <p className="text-muted small mb-0">
                          <i className="bi bi-clock me-1"></i>
                          {formatDate(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notif.id);
                          }}
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="bi bi-check2"></i> Marquer lu
                        </button>
                      )}
                    </div>
                  </div>
                );
              } else if (notif.kind === 'EVENT_ASSIGNED') {
                // Événement assigné
                if (!notif.metadata) return null;
                const metadata = JSON.parse(notif.metadata);

                return (
                  <div
                    key={notif.id}
                    className={`list-group-item ${!notif.isRead ? 'bg-light' : ''}`}
                    style={{ borderLeft: '4px solid #10b981', cursor: 'pointer' }}
                    onClick={() => {
                      handleMarkAsRead(notif.id);
                      router.push('/calendar');
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-calendar-plus text-success me-2" style={{ fontSize: '1.5rem' }}></i>
                          <h6 className="mb-0">📆 Nouvel événement assigné</h6>
                          {!notif.isRead && (
                            <span className="badge bg-danger ms-2">Nouveau</span>
                          )}
                        </div>
                        <p className="mb-2">
                          <strong>{metadata.creatorName}</strong> vous a assigné un événement: <strong>{metadata.eventTitle}</strong>
                        </p>
                        <p className="text-muted small mb-0">
                          <i className="bi bi-clock me-1"></i>
                          {formatDate(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notif.id);
                          }}
                          className="btn btn-sm btn-outline-success"
                        >
                          <i className="bi bi-check2"></i> Marquer lu
                        </button>
                      )}
                    </div>
                  </div>
                );
              } else if (notif.kind === 'EVENT_PARTICIPANT') {
                // Ajouté comme participant
                if (!notif.metadata) return null;
                const metadata = JSON.parse(notif.metadata);

                return (
                  <div
                    key={notif.id}
                    className={`list-group-item ${!notif.isRead ? 'bg-light' : ''}`}
                    style={{ borderLeft: '4px solid #3b82f6', cursor: 'pointer' }}
                    onClick={() => {
                      handleMarkAsRead(notif.id);
                      router.push('/calendar');
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-people-fill text-primary me-2" style={{ fontSize: '1.5rem' }}></i>
                          <h6 className="mb-0">👥 Ajouté à un événement</h6>
                          {!notif.isRead && (
                            <span className="badge bg-danger ms-2">Nouveau</span>
                          )}
                        </div>
                        <p className="mb-2">
                          <strong>{metadata.creatorName || metadata.editorName}</strong> vous a ajouté à l&apos;événement: <strong>{metadata.eventTitle}</strong>
                        </p>
                        <p className="text-muted small mb-0">
                          <i className="bi bi-clock me-1"></i>
                          {formatDate(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notif.id);
                          }}
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="bi bi-check2"></i> Marquer lu
                        </button>
                      )}
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
