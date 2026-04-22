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

const TABS = [
  { id: 'referent-vendeur', label: 'Referent \u2194 Vendeur', icon: '\uD83D\uDC65', description: 'Conversations entre referents et vendeurs' },
  { id: 'admin-referent', label: 'Admin \u2194 Referent', icon: '\uD83C\uDFAF', description: 'Escalades et demandes des referents' },
  { id: 'admin-vendeur', label: 'Admin \u2194 Vendeur', icon: '\u26A1', description: 'Interventions directes aupres des vendeurs' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function ExchangesViewer() {
  const [activeTab, setActiveTab] = useState<TabId>('referent-vendeur');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

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
    } catch {
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
    } catch {
      console.error('Erreur chargement messages');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #ede9fe', padding: '12px 16px 0' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              background: activeTab === tab.id ? '#7c3aed' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '10px 10px 0 0',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card-body">
        {/* Description tab active */}
        <p className="text-muted small mb-3">
          {TABS.find(t => t.id === activeTab)?.description}
        </p>

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
                          <Image src={conv.user1.avatar} alt={conv.user1.email} width={32} height={32}
                            className="rounded-circle" style={{ objectFit: 'cover' }} />
                        ) : (
                          <div className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '32px', height: '32px', background: '#7c3aed' }}>
                            <i className="bi bi-person text-white"></i>
                          </div>
                        )}
                        <small className={selectedConversation?.user1.id === conv.user1.id && selectedConversation?.user2.id === conv.user2.id ? 'text-white' : ''}>
                          {conv.user1.email}
                        </small>
                      </div>
                      <div className="d-flex align-items-center justify-content-center my-1">
                        <i className="bi bi-arrow-down-up text-muted"></i>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        {conv.user2.avatar ? (
                          <Image src={conv.user2.avatar} alt={conv.user2.email} width={32} height={32}
                            className="rounded-circle" style={{ objectFit: 'cover' }} />
                        ) : (
                          <div className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '32px', height: '32px', background: '#059669' }}>
                            <i className="bi bi-person text-white"></i>
                          </div>
                        )}
                        <small className={selectedConversation?.user1.id === conv.user1.id && selectedConversation?.user2.id === conv.user2.id ? 'text-white' : ''}>
                          {conv.user2.email}
                        </small>
                      </div>
                      {conv.messageCount > 0 && (
                        <div className="mt-2 text-end">
                          <span className={`badge ${selectedConversation?.user1.id === conv.user1.id && selectedConversation?.user2.id === conv.user2.id ? 'bg-white text-primary' : 'bg-secondary'}`}>
                            {conv.messageCount} msg
                          </span>
                        </div>
                      )}
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
                <p className="mt-3">Selectionnez une conversation pour voir les messages</p>
              </div>
            ) : (
              <>
                <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
                  <div>
                    <h6 className="mb-1">Conversation</h6>
                    <small className="text-muted">
                      {selectedConversation.user1.email} \u2194 {selectedConversation.user2.email}
                    </small>
                  </div>
                  <span className="badge" style={{ background: '#7c3aed', color: 'white' }}>Lecture seule</span>
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
                      <p className="mt-3">Aucun message echange</p>
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
                              <Image src={message.from.avatar} alt="Avatar" width={32} height={32}
                                className="rounded-circle" style={{ objectFit: 'cover' }} />
                            ) : (
                              <div className="rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: '32px', height: '32px', minWidth: '32px', background: '#7c3aed' }}>
                                <i className="bi bi-person text-white"></i>
                              </div>
                            )
                          )}
                          <div
                            className="p-3 rounded"
                            style={message.fromUserId === selectedConversation.user1.id
                              ? { background: '#f5f3ff' }
                              : { background: '#7c3aed', color: 'white' }
                            }
                          >
                            <div className="small mb-1 fw-semibold">
                              {message.fromUserId === selectedConversation.user1.id
                                ? selectedConversation.user1.email
                                : selectedConversation.user2.email}
                            </div>
                            <p className="mb-1">{message.body}</p>
                            <small style={message.fromUserId === selectedConversation.user1.id
                              ? { color: '#9ca3af' }
                              : { color: 'rgba(255,255,255,0.6)' }
                            }>
                              {new Date(message.createdAt).toLocaleString('fr-FR')}
                            </small>
                          </div>
                          {message.fromUserId === selectedConversation.user2.id && (
                            message.from.avatar ? (
                              <Image src={message.from.avatar} alt="Avatar" width={32} height={32}
                                className="rounded-circle" style={{ objectFit: 'cover' }} />
                            ) : (
                              <div className="rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: '32px', height: '32px', minWidth: '32px', background: '#059669' }}>
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
