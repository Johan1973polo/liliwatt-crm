'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Message {
  id: string;
  body: string;
  createdAt: Date;
  fromUserId: string;
  toUserId: string;
  from: { email: string; role: string; avatar: string | null };
  to: { email: string; role: string; avatar: string | null };
}

interface Referent {
  id: string;
  email: string;
  phone: string | null;
  avatar: string | null;
}

export default function MessagesInterface({
  currentUserId,
  currentUserRole,
  referent,
  initialMessages,
}: {
  currentUserId: string;
  currentUserRole?: string;
  referent: Referent | null;
  initialMessages: Message[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Rafraîchir les messages toutes les 10 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 10000);

    return () => clearInterval(interval);
  }, [router]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !referent) {
      alert('Veuillez écrire un message');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUserId: referent.id,
          body: newMessage,
        }),
      });

      if (response.ok) {
        setNewMessage('');
        router.refresh();
      } else {
        alert('Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setLoading(false);
    }
  };

  if (!referent) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <i className="bi bi-inbox display-1 text-muted"></i>
          <p className="text-muted mt-3 mb-0">
            Vous n&apos;avez pas de référent assigné.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col-lg-8 mx-auto">
        {/* Info référent avec message d'accueil */}
        <div className="card mb-3">
          <div className="card-body">
            <div className="d-flex align-items-start gap-3">
              {referent.avatar ? (
                <Image
                  src={referent.avatar}
                  alt={referent.email}
                  width={64}
                  height={64}
                  className="rounded-circle"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="rounded-circle bg-info d-flex align-items-center justify-content-center"
                  style={{ width: '64px', height: '64px', minWidth: '64px' }}
                >
                  <i className="bi bi-person-fill text-white" style={{ fontSize: '2rem' }}></i>
                </div>
              )}
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <h6 className="mb-0">{referent.email}</h6>
                  <span className="badge bg-info">Référent</span>
                </div>
                {referent.phone && (
                  <p className="text-muted small mb-2">
                    <i className="bi bi-telephone me-1"></i>
                    <a href={`tel:${referent.phone}`} className="text-decoration-none">
                      {referent.phone}
                    </a>
                  </p>
                )}
                <div className="alert alert-info mb-0 mt-2">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Je suis là pour t&apos;aider, n&apos;hésite pas à m&apos;écrire !</strong>
                </div>
              </div>
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
                  const senderRole = isFromMe ? currentUserRole : msg.from.role;

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
                  className="btn btn-primary h-100"
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
    </div>
  );
}
