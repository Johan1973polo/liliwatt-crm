'use client';

import { useState, useEffect } from 'react';

export default function ReferentAnnounceClient({
  vendeurCount,
  referentName,
  hasVisio,
}: {
  vendeurCount: number;
  referentName: string;
  hasVisio: boolean;
}) {
  const [tab, setTab] = useState<'annonce' | 'briefing'>('annonce');

  // Annonce simple
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loadingAnnonce, setLoadingAnnonce] = useState(false);

  // Briefing
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [briefingMsg, setBriefingMsg] = useState('');
  const [loadingBriefing, setLoadingBriefing] = useState(false);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const formatDateFR = (d: string, t: string) => {
    if (!d) return '';
    const dt = new Date(`${d}T${t}:00`);
    return dt.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  async function envoyerAnnonce() {
    if (!title.trim() || !message.trim()) { alert('Titre et message obligatoires'); return; }
    if (!confirm(`Envoyer cette annonce a ${vendeurCount} vendeur(s) ?`)) return;
    setLoadingAnnonce(true);
    try {
      const res = await fetch('/api/referent/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), message: message.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Annonce envoyee a ${data.recipients} vendeur(s) !`);
        setTitle(''); setMessage('');
      } else {
        alert(data.error || 'Erreur');
      }
    } catch { alert('Erreur reseau'); }
    finally { setLoadingAnnonce(false); }
  }

  async function envoyerBriefing() {
    if (!date || !time) { alert('Date et heure obligatoires'); return; }
    if (!confirm(`Envoyer les invitations briefing a ${vendeurCount} vendeur(s) ?`)) return;
    setLoadingBriefing(true);
    try {
      const res = await fetch('/api/referent/briefings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time, message: briefingMsg.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`${data.invited} vendeur(s) invite(s) au briefing !`);
        setBriefingMsg('');
      } else {
        alert(data.error || 'Erreur');
      }
    } catch { alert('Erreur reseau'); }
    finally { setLoadingBriefing(false); }
  }

  const tabStyle = (active: boolean) => ({
    padding: '12px 24px',
    border: 'none',
    borderBottom: active ? '3px solid #7c3aed' : '3px solid transparent',
    background: active ? 'rgba(124,58,237,0.08)' : 'transparent',
    color: active ? '#7c3aed' : '#6b7280',
    fontWeight: active ? 700 : 500,
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    borderRadius: '8px 8px 0 0',
  });

  return (
    <div className="card">
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e9d5ff', padding: '0 16px' }}>
        <button style={tabStyle(tab === 'annonce')} onClick={() => setTab('annonce')}>
          <i className="bi bi-chat-dots me-2"></i>Annonce simple
        </button>
        <button style={tabStyle(tab === 'briefing')} onClick={() => setTab('briefing')}>
          <i className="bi bi-calendar-event me-2"></i>Briefing
        </button>
      </div>

      <div className="card-body">
        {tab === 'annonce' ? (
          /* ========== TAB ANNONCE ========== */
          <>
            <div className="mb-3">
              <label className="form-label fw-semibold">
                <i className="bi bi-type-h1 me-2"></i>Titre
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: Objectifs de la semaine"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loadingAnnonce}
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">
                <i className="bi bi-chat-text me-2"></i>Message
              </label>
              <textarea
                className="form-control"
                rows={6}
                placeholder="Ecrivez votre message ici..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loadingAnnonce}
              />
              <small className="text-muted">
                Vos {vendeurCount} vendeur(s) recevront une notification + un email.
              </small>
            </div>
            <div className="d-grid">
              <button
                className="btn btn-lg"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #d946ef)',
                  color: 'white', fontWeight: 700, border: 'none',
                }}
                onClick={envoyerAnnonce}
                disabled={loadingAnnonce || !title.trim() || !message.trim()}
              >
                <i className="bi bi-megaphone me-2"></i>
                {loadingAnnonce ? 'Envoi en cours...' : "Envoyer l'annonce"}
              </button>
            </div>
          </>
        ) : (
          /* ========== TAB BRIEFING ========== */
          <>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  <i className="bi bi-calendar3 me-2"></i>Date du briefing
                </label>
                <input
                  type="date"
                  className="form-control"
                  min={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={loadingBriefing}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  <i className="bi bi-clock me-2"></i>Heure
                </label>
                <input
                  type="time"
                  className="form-control"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  disabled={loadingBriefing}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                <i className="bi bi-chat-text me-2"></i>Message complementaire (optionnel)
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Preparez vos chiffres de la semaine..."
                value={briefingMsg}
                onChange={(e) => setBriefingMsg(e.target.value)}
                disabled={loadingBriefing}
              />
            </div>

            {/* Preview */}
            {date && (
              <div style={{
                background: 'linear-gradient(135deg, #f5f3ff, #fae8ff)',
                borderLeft: '4px solid #7c3aed',
                borderRadius: '12px',
                padding: '20px 24px',
                marginBottom: '20px',
              }}>
                <div style={{ color: '#7c3aed', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Apercu de l&apos;invitation
                </div>
                <div style={{ color: '#1e1b4b', fontSize: '16px', fontWeight: 600 }}>
                  <i className="bi bi-calendar-event me-2"></i>
                  Vous allez convier <strong>{vendeurCount}</strong> vendeur{vendeurCount > 1 ? 's' : ''} au briefing du{' '}
                  <strong style={{ textTransform: 'capitalize' }}>{formatDateFR(date, time)}</strong> a <strong>{time}</strong>
                </div>
                {!hasVisio && (
                  <div className="mt-2" style={{ color: '#dc2626', fontSize: '13px' }}>
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    Aucun lien Meet configure. Vos vendeurs ne verront pas de bouton &quot;Rejoindre le salon&quot;.
                  </div>
                )}
              </div>
            )}

            <div className="d-grid">
              <button
                className="btn btn-lg"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #d946ef)',
                  color: 'white', fontWeight: 700, border: 'none',
                }}
                onClick={envoyerBriefing}
                disabled={loadingBriefing || !date || !time}
              >
                <i className="bi bi-send me-2"></i>
                {loadingBriefing ? 'Envoi en cours...' : 'Envoyer les invitations'}
              </button>
            </div>
          </>
        )}

        <div className="alert mt-4 mb-0" style={{ background: '#f5f3ff', border: '1px solid #e9d5ff' }}>
          <i className="bi bi-info-circle me-2" style={{ color: '#7c3aed' }}></i>
          <small style={{ color: '#4b5563' }}>
            {tab === 'annonce'
              ? 'Chaque vendeur recevra un email + une notification dans son espace CRM.'
              : 'Chaque vendeur recevra un email avec le lien Meet + le briefing apparaitra dans ses annonces CRM.'}
          </small>
        </div>
      </div>
    </div>
  );
}
