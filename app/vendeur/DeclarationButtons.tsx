'use client';

import { useState } from 'react';

export default function DeclarationButtons() {
  const [showVente, setShowVente] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [montant, setMontant] = useState('');
  const [factureOk, setFactureOk] = useState(false);

  const handleFacture = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/declarations/facture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setFactureOk(true);
        setTimeout(() => setFactureOk(false), 2000);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleVente = async () => {
    if (!montant || parseFloat(montant) <= 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/declarations/vente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ montant_commission: parseFloat(montant) }),
      });
      if (res.ok) {
        setSuccess('Vente déclarée ! Toute l\'équipe a été notifiée !');
        setShowVente(false);
        setMontant('');
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '20px', border: '1px solid #fde68a' }}>
      <div style={{ background: 'linear-gradient(90deg, #854d0e, #ca8a04)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }}></span>
        <span style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>🏆 Annonces à l&apos;équipe</span>
      </div>

      <div style={{ background: '#fffbeb', padding: '20px 24px' }}>
        {success && (
          <div className="alert alert-success py-2 mb-3">
            <i className="bi bi-check-circle me-2"></i>{success}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'stretch' }}>
          {/* Bouton Facture - violet - clic direct */}
          <button
            onClick={handleFacture}
            disabled={loading}
            style={{
              background: factureOk ? '#16a34a' : '#7c3aed',
              border: 'none', borderRadius: '14px', padding: '20px 16px',
              color: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '10px',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => { if (!factureOk) (e.currentTarget).style.filter = 'brightness(0.9)'; }}
            onMouseLeave={e => { (e.currentTarget).style.filter = 'none'; }}
          >
            <span style={{ fontSize: '28px' }}>{factureOk ? '✅' : '🔔'}</span>
            <span style={{ fontSize: '14px', fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>
              {factureOk ? 'Annoncé !' : <>J&apos;ai récupéré<br />une facture !</>}
            </span>
          </button>

          {/* Image centre */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero-annonces.png"
              alt=""
              style={{ maxWidth: '180px', width: '100%', borderRadius: '12px' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>

          {/* Bouton Vente - gold */}
          <button
            onClick={() => setShowVente(true)}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #854d0e, #ca8a04, #fbbf24, #ca8a04, #854d0e)',
              border: 'none', borderRadius: '14px', padding: '20px 16px',
              color: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '10px',
              transition: 'filter 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget).style.filter = 'brightness(0.9)'; }}
            onMouseLeave={e => { (e.currentTarget).style.filter = 'none'; }}
          >
            <span style={{ fontSize: '28px' }}>🏆</span>
            <span style={{ fontSize: '14px', fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>
              J&apos;ai signé<br />un client !
            </span>
          </button>
        </div>

        {/* Formulaire Vente - un seul champ */}
        {showVente && (
          <div className="mt-3 p-3 rounded" style={{ background: 'white', border: '1px solid #fde68a' }}>
            <h6 className="mb-3"><i className="bi bi-trophy-fill me-2" style={{ color: '#ca8a04' }}></i>Déclarer une vente</h6>
            <div className="mb-3">
              <input
                type="number"
                className="form-control form-control-lg"
                placeholder="Montant commission en €"
                value={montant}
                onChange={e => setMontant(e.target.value)}
                min="0"
                step="0.01"
                style={{ fontSize: '18px', textAlign: 'center' }}
              />
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn text-white flex-fill py-2"
                style={{ background: 'linear-gradient(135deg, #854d0e, #ca8a04)', border: 'none', fontWeight: 700 }}
                onClick={handleVente}
                disabled={loading || !montant || parseFloat(montant) <= 0}
              >
                {loading ? <span className="spinner-border spinner-border-sm"></span> : '🏆 Déclarer la vente !'}
              </button>
              <button className="btn btn-outline-secondary" onClick={() => setShowVente(false)}>Annuler</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
