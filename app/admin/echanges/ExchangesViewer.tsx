'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface User {
  id: string;
  email: string;
  avatar: string | null;
  phone?: string | null;
  referentId?: string | null;
}

interface Message {
  id: string;
  body: string;
  createdAt: Date;
  fromUserId: string;
  toUserId: string;
  from: { email: string; avatar: string | null };
  to: { email: string; avatar: string | null };
}

interface Conversation {
  user1: User;
  user2: User;
  lastMessage?: Date;
  messageCount: number;
}

export default function ExchangesViewer({
  referents,
  vendeurs,
  backofficeUsers,
}: {
  referents: User[];
  vendeurs: User[];
  backofficeUsers: User[];
}) {
  const [activeTab, setActiveTab] = useState<'referent-vendeur' | 'referent-backoffice' | 'backoffice-vendeur'>('referent-vendeur');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les conversations selon l'onglet actif
  useEffect(() => {
    loadConversations();
  }, [activeTab]);

  const loadConversations = async () => {
    setLoading(true);
    setSelectedConversation(null);
    setMessages([]);

    try {
      const response = await fetch(`/api/admin/exchanges?type=${activeTab}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Erreur chargement conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/exchanges/messages?user1Id=${conversation.user1.id}&user2Id=${conversation.user2.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Erreur chargement messages');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="card">
      <div className="card-header bg-white">
        <ul className="nav nav-tabs card-header-tabs">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'referent-vendeur' ? 'active' : ''}`}
              onClick={() => setActiveTab('referent-vendeur')}
            >
              <i className="bi bi-arrow-left-right me-2"></i>
              Référent - Vendeur
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'referent-backoffice' ? 'active' : ''}`}
              onClick={() => setActiveTab('referent-backoffice')}
            >
              <i className="bi bi-arrow-left-right me-2"></i>
              Référent - Back-Office
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'backoffice-vendeur' ? 'active' : ''}`}
              onClick={() => setActiveTab('backoffice-vendeur')}
            >
              <i className="bi bi-arrow-left-right me-2"></i>
              Back-Office - Vendeur
            </button>
          </li>
        </ul>
      </div>

      <div className="card-body">
        <div className="row">
          <div className="col-lg-4 border-end">
            <h6 className="mb-3">Conversations</h6>
            {loading && !selectedConversation ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
              </div>
            ) : (
              <div className="list-group">
                {conversations.length === 0 ? (
                  <div className="text-muted text-center py-4">
                    Aucune conversation disponible
                  </div>
                ) : (
                  conversations.map((conv, idx) => (
                    <button
                      key={`${conv.user1.id}-${conv.user2.id}-${idx}`}
                      onClick={() => loadMessages(conv)}
                      className={`list-group-item list-group-item-action ${
                        selectedConversation?.user1.id === conv.user1.id &&
                        selectedConversation?.user2.id === conv.user2.id
                          ? 'active'
                          : ''
                      }`}
                    >
                      <div className="d-flex align-items-center gap-2 mb-2">
                        {conv.user1.avatar ? (
                          <Image
                            src={conv.user1.avatar}
                            alt={conv.user1.email}
                            width={32}
                            height={32}
                            className="rounded-circle"
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                            <i className="bi bi-person text-white"></i>
                          </div>
                        )}
                        <small className={selectedConversation?.user1.id === conv.user1.id && selectedConversation?.user2.id === conv.user2.id ? 'text-white' : ''}>{conv.user1.email}</small>
                      </div>
                      <div className="d-flex align-items-center justify-content-center my-1">
                        <i className="bi bi-arrow-down-up text-muted"></i>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        {conv.user2.avatar ? (
                          <Image
                            src={conv.user2.avatar}
                            alt={conv.user2.email}
                            width={32}
                            height={32}
                            className="rounded-circle"
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="rounded-circle bg-success d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                            <i className="bi bi-person text-white"></i>
                          </div>
                        )}
                        <small className={selectedConversation?.user1.id === conv.user1.id && selectedConversation?.user2.id === conv.user2.id ? 'text-white' : ''}>{conv.user2.email}</small>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="col-lg-8">
            {!selectedConversation ? (
              <div className="text-center text-muted py-5">
                <i className="bi bi-chat-square-text display-1"></i>
                <p className="mt-3">Sélectionnez une conversation pour voir les messages</p>
              </div>
            ) : (
              <>
                <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
                  <div>
                    <h6 className="mb-1">Conversation</h6>
                    <small className="text-muted">
                      {selectedConversation.user1.email} ↔ {selectedConversation.user2.email}
                    </small>
                  </div>
                  <span className="badge bg-secondary">Lecture seule</span>
                </div>

                <div style={{ height: '500px', overflowY: 'auto' }}>
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted py-5">
                      <i className="bi bi-chat-dots display-4"></i>
                      <p className="mt-3">Aucun message échangé</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`d-flex mb-3 ${
                          message.fromUserId === selectedConversation.user1.id
                            ? 'justify-content-start'
                            : 'justify-content-end'
                        }`}
                      >
                        <div className="d-flex align-items-start gap-2" style={{ maxWidth: '70%' }}>
                          {message.fromUserId === selectedConversation.user1.id && (
                            message.from.avatar ? (
                              <Image
                                src={message.from.avatar}
                                alt="Avatar"
                                width={32}
                                height={32}
                                className="rounded-circle"
                                style={{ objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', minWidth: '32px' }}>
                                <i className="bi bi-person text-white"></i>
                              </div>
                            )
                          )}
                          <div
                            className={`p-3 rounded ${
                              message.fromUserId === selectedConversation.user1.id
                                ? 'bg-light'
                                : 'bg-primary text-white'
                            }`}
                          >
                            <div className="small mb-1 fw-semibold">
                              {message.fromUserId === selectedConversation.user1.id
                                ? selectedConversation.user1.email
                                : selectedConversation.user2.email}
                            </div>
                            <p className="mb-1">{message.body}</p>
                            <small
                              className={
                                message.fromUserId === selectedConversation.user1.id
                                  ? 'text-muted'
                                  : 'text-white-50'
                              }
                            >
                              {new Date(message.createdAt).toLocaleString('fr-FR')}
                            </small>
                          </div>
                          {message.fromUserId === selectedConversation.user2.id && (
                            message.from.avatar ? (
                              <Image
                                src={message.from.avatar}
                                alt="Avatar"
                                width={32}
                                height={32}
                                className="rounded-circle"
                                style={{ objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="rounded-circle bg-success d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', minWidth: '32px' }}>
                                <i className="bi bi-person text-white"></i>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
