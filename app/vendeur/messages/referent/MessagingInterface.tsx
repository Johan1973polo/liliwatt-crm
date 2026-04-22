'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import Image from 'next/image';

interface User {
  id: string;
  email: string;
  avatar: string | null;
  phone?: string | null;
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
  referents,
  category,
}: {
  currentUserId: string;
  referents: User[];
  category: string;
}) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    referents.length > 0 ? referents[0].id : null
  );
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
    fetch('/api/messages/mark-read', { method: 'POST' })
      .then(() => mutate('/api/messages/count-unread'))
      .catch(() => {});
  }, []);

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

  const selectedUser = referents.find(r => r.id === selectedUserId);

  return (
    <div className="row">
      <div className="col-lg-4 mb-3">
        <div className="card">
          <div className="card-header bg-white">
            <h6 className="mb-0">Votre Référent</h6>
          </div>
          <div className="list-group list-group-flush">
            {referents.length === 0 ? (
              <div className="list-group-item text-muted">
                Aucun référent assigné
              </div>
            ) : (
              referents.map((referent) => (
                <button
                  key={referent.id}
                  onClick={() => setSelectedUserId(referent.id)}
                  className={`list-group-item list-group-item-action ${selectedUserId === referent.id ? 'active' : ''}`}
                >
                  <div className="d-flex align-items-center gap-2">
                    {referent.avatar ? (
                      <Image
                        src={referent.avatar}
                        alt={referent.email}
                        width={40}
                        height={40}
                        className="rounded-circle"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="rounded-circle bg-warning d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px', minWidth: '40px' }}
                      >
                        <i className="bi bi-person text-white"></i>
                      </div>
                    )}
                    <div className="flex-grow-1 text-start">
                      <div className="fw-semibold">{referent.email}</div>
                      {referent.phone && (
                        <small className={selectedUserId === referent.id ? 'text-white-50' : 'text-muted'}>
                          <i className="bi bi-telephone me-1"></i>
                          {referent.phone}
                        </small>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="col-lg-8">
        {!selectedUserId ? (
          <div className="card">
            <div className="card-body text-center py-5">
              <i className="bi bi-chat-dots display-1 text-muted"></i>
              <p className="text-muted mt-3">Sélectionnez votre référent pour commencer une conversation</p>
            </div>
          </div>
        ) : (
          <>
            <div className="card mb-3">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3">
                  {selectedUser?.avatar ? (
                    <Image
                      src={selectedUser.avatar}
                      alt={selectedUser.email}
                      width={64}
                      height={64}
                      className="rounded-circle"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-warning d-flex align-items-center justify-content-center"
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
                  <span className="badge bg-warning text-dark">Référent</span>
                </div>
              </div>
            </div>

            {/* Zone de messages */}
            <div className="card mb-3">
              <div
                className="card-body"
                style={{
                  height: '500px',
                  overflowY: 'auto',
                  backgroundColor: '#f8f9fa',
                }}
              >
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
                      className="btn btn-warning h-100"
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
          </>
        )}
      </div>
    </div>
  );
}
