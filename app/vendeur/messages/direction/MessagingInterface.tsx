'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface User {
  id: string;
  email: string;
  avatar: string | null;
  phone?: string | null;
  specialty?: string | null;
}

interface Message {
  id: string;
  body: string;
  createdAt: Date;
  fromUserId: string;
  toUserId: string;
  from: { email: string; role: string; avatar: string | null };
  to: { email: string; role: string; avatar: string | null };
}

export default function MessagingInterface({
  currentUserId,
  admins,
  category,
  unreadCountsByUser,
}: {
  currentUserId: string;
  admins: User[];
  category: string;
  unreadCountsByUser: { adminId: string; count: number; }[];
}) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [hasRefreshed, setHasRefreshed] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedUserId) {
      loadMessages(selectedUserId);
      const interval = setInterval(() => {
        loadMessages(selectedUserId);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [selectedUserId]);

  const loadMessages = async (userId: string) => {
    try {
      const response = await fetch(`/api/messages?otherUserId=${userId}&category=${category}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);

        // Rafraîchir la Navbar une seule fois après le premier chargement
        if (!hasRefreshed) {
          setTimeout(() => {
            router.refresh();
            setHasRefreshed(true);
          }, 500);
        }
      }
    } catch (error) {
      console.error('Erreur chargement messages');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUserId) {
      alert('Veuillez écrire un message');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUserId: selectedUserId,
          body: newMessage,
          category,
        }),
      });

      if (response.ok) {
        setNewMessage('');
        loadMessages(selectedUserId);
      } else {
        alert('Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = admins.find(a => a.id === selectedUserId);

  return (
    <div className="row">
      <div className="col-lg-4 mb-3">
        <div className="card">
          <div className="card-header bg-white">
            <h6 className="mb-0">Direction</h6>
          </div>
          <div className="list-group list-group-flush">
            {admins.length === 0 ? (
              <div className="list-group-item text-muted">
                Aucun membre de la direction disponible
              </div>
            ) : (
              admins.map((admin) => {
                const unreadCount = unreadCountsByUser.find(u => u.adminId === admin.id)?.count || 0;
                return (
                  <button
                    key={admin.id}
                    onClick={() => setSelectedUserId(admin.id)}
                    className={`list-group-item list-group-item-action ${selectedUserId === admin.id ? 'active' : ''}`}
                  >
                    <div className="d-flex align-items-center gap-2">
                      {admin.avatar ? (
                        <Image
                          src={admin.avatar}
                          alt={admin.email}
                          width={40}
                          height={40}
                          className="rounded-circle"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          className="rounded-circle bg-danger d-flex align-items-center justify-content-center"
                          style={{ width: '40px', height: '40px', minWidth: '40px' }}
                        >
                          <i className="bi bi-person text-white"></i>
                        </div>
                      )}
                      <div className="flex-grow-1 text-start">
                        <div className="fw-semibold">{admin.email}</div>
                        {admin.specialty && (
                          <small className={selectedUserId === admin.id ? 'text-white-50' : 'text-muted'}>
                            {admin.specialty}
                          </small>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <span className="badge bg-danger rounded-pill">{unreadCount}</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="col-lg-8">
        {!selectedUserId ? (
          <div className="card">
            <div className="card-body text-center py-5">
              <i className="bi bi-chat-dots display-1 text-muted"></i>
              <p className="text-muted mt-3">Sélectionnez un membre de la direction pour commencer une conversation</p>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-header bg-white">
              <div className="d-flex align-items-center gap-2">
                {selectedUser?.avatar ? (
                  <Image
                    src={selectedUser.avatar}
                    alt={selectedUser.email}
                    width={32}
                    height={32}
                    className="rounded-circle"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-danger d-flex align-items-center justify-content-center"
                    style={{ width: '64px', height: '64px', minWidth: '64px' }}
                  >
                    <i className="bi bi-person-fill text-white" style={{ fontSize: '2rem' }}></i>
                  </div>
                )}
                <div className="flex-grow-1">
                  <h6 className="mb-1">{selectedUser?.email}</h6>
                  {selectedUser?.phone && (
                    <p className="text-muted small mb-0">
                      <i className="bi bi-telephone me-1"></i>
                      <a href={`tel:${selectedUser.phone}`} className="text-decoration-none">
                        {selectedUser.phone}
                      </a>
                    </p>
                  )}
                </div>
                <span className="badge bg-danger">
                  {selectedUser?.specialty ? `Admin - ${selectedUser.specialty}` : 'Admin'}
                </span>
              </div>
            </div>
            <div className="card-body" style={{ height: '500px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
              {messages.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-chat-text display-4"></i>
                  <p className="mt-3">Aucun message pour le moment</p>
                  <p className="small">Envoyez votre premier message ci-dessous</p>
                </div>
              ) : (
                <div>
                  {messages.map((msg) => {
                    const isFromMe = msg.fromUserId === currentUserId;
                    const senderAvatar = isFromMe ? null : msg.from.avatar;
                    const senderRole = isFromMe ? 'VENDEUR' : msg.from.role;

                    // Déterminer la couleur selon le rôle de l'expéditeur
                    let bgColor = 'bg-primary'; // Par défaut
                    let textColor = 'text-white';

                    if (senderRole === 'VENDEUR') {
                      bgColor = 'bg-primary'; // Bleu
                      textColor = 'text-white';
                    } else if (senderRole === 'REFERENT') {
                      bgColor = 'bg-warning'; // Orange
                      textColor = 'text-dark';
                    } else if (senderRole === 'ADMIN') {
                      bgColor = 'bg-danger'; // Rouge
                      textColor = 'text-white';
                    } else if (senderRole ===) {
                      bgColor = 'bg-purple'; // Violet
                      textColor = 'text-white';
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`d-flex mb-3 align-items-start gap-2 ${
                          isFromMe ? 'justify-content-end flex-row-reverse' : 'justify-content-start'
                        }`}
                      >
                        {/* Avatar de l'expéditeur */}
                        {!isFromMe && (
                          <div style={{ minWidth: '40px' }}>
                            {senderAvatar ? (
                              <Image
                                src={senderAvatar}
                                alt={msg.from.email}
                                width={40}
                                height={40}
                                className="rounded-circle"
                                style={{ objectFit: 'cover' }}
                              />
                            ) : (
                              <div
                                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                                style={{ width: '40px', height: '40px' }}
                              >
                                <i className="bi bi-person-fill text-white"></i>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Bulle de message avec fond coloré selon le rôle */}
                        <div
                          className={`p-3 rounded ${bgColor} ${textColor}`}
                          style={{ maxWidth: '70%' }}
                        >
                          <p className="mb-1">{msg.body}</p>
                          <p
                            className={`small mb-0 ${textColor === 'text-white' ? 'opacity-75' : 'opacity-50'}`}
                          >
                            {new Date(msg.createdAt).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            {/* Zone d'envoi */}
            <div className="card">
              <div className="card-body">
                <div className="row g-2">
                  <div className="col">
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Écrivez votre message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={loading}
                    ></textarea>
                  </div>
                  <div className="col-auto">
                    <button
                      onClick={handleSendMessage}
                      className="btn btn-danger h-100"
                      disabled={loading || !newMessage.trim()}
                    >
                      <i className="bi bi-send me-1"></i>
                      Envoyer
                    </button>
                  </div>
                </div>
                <small className="text-muted">
                  Appuyez sur Entrée pour envoyer
                </small>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
