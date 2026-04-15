'use client';

import { useState } from 'react';

export default function DeclarationButtons() {
  const [showFacture, setShowFacture] = useState(false);
  const [showVente, setShowVente] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const [facSociete, setFacSociete] = useState('');
  const [facType, setFacType] = useState('electricite');
  const [facNotes, setFacNotes] = useState('');

  const [venteSociete, setVenteSociete] = useState('');
  const [venteFournisseur, setVenteFournisseur] = useState('');
  const [venteSegment, setVenteSegment] = useState('C5');

  const handleFacture = async () => {
    if (!facSociete.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/declarations/facture', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ societe: facSociete, type: facType, notes: facNotes }),
      });
      if (res.ok) {
        setSuccess('Facture déclarée avec succès !');
        setShowFacture(false); setFacSociete(''); setFacNotes('');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleVente = async () => {
    if (!venteSociete.trim() || !venteFournisseur.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/declarations/vente', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ societe: venteSociete, fournisseur: venteFournisseur, segment: venteSegment }),
      });
      if (res.ok) {
        setSuccess('Vente déclarée ! Toute l\'équipe a été notifiée !');
        setShowVente(false); setVenteSociete(''); setVenteFournisseur('');
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '20px', border: '1px solid #fde68a' }}>
      {/* Bandeau header vert */}
      <div style={{ background: 'linear-gradient(90deg, #854d0e, #ca8a04)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }}></span>
        <span style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>🏆 Annonces à l&apos;équipe</span>
      </div>

      {/* Corps */}
      <div style={{ background: '#fffbeb', padding: '20px 24px' }}>
        {success && (
          <div className="alert alert-success py-2 mb-3">
            <i className="bi bi-check-circle me-2"></i>{success}
          </div>
        )}

        {/* Grid 3 colonnes : bouton | image | bouton */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'stretch' }}>
          {/* Bouton Facture - violet */}
          <button
            onClick={() => { setShowFacture(true); setShowVente(false); }}
            style={{
              background: '#7c3aed', border: 'none', borderRadius: '14px', padding: '20px 16px',
              color: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'filter 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget).style.filter = 'brightness(0.9)'; }}
            onMouseLeave={e => { (e.currentTarget).style.filter = 'none'; }}
          >
            <span style={{ fontSize: '28px' }}>🔔</span>
            <span style={{ fontSize: '14px', fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>
              J&apos;ai récupéré<br />une facture !
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
            onClick={() => { setShowVente(true); setShowFacture(false); }}
            style={{
              background: 'linear-gradient(135deg, #854d0e, #ca8a04, #fbbf24, #ca8a04, #854d0e)', border: 'none', borderRadius: '14px', padding: '20px 16px',
              color: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'filter 0.2s',
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

        {/* Formulaire Facture */}
        {showFacture && (
          <div className="mt-3 p-3 rounded" style={{ background: 'white', border: '1px solid #e9d5ff' }}>
            <h6 className="mb-3"><i className="bi bi-bell-fill me-2 text-primary"></i>Déclarer une facture récupérée</h6>
            <div className="mb-2"><input type="text" className="form-control" placeholder="Nom de la société" value={facSociete} onChange={e => setFacSociete(e.target.value)} /></div>
            <div className="mb-2">
              <select className="form-select" value={facType} onChange={e => setFacType(e.target.value)}>
                <option value="electricite">Électricité</option><option value="gaz">Gaz</option><option value="les_deux">Électricité + Gaz</option>
              </select>
            </div>
            <div className="mb-3"><input type="text" className="form-control" placeholder="Notes (optionnel)" value={facNotes} onChange={e => setFacNotes(e.target.value)} /></div>
            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={handleFacture} disabled={loading || !facSociete.trim()}>{loading ? <span className="spinner-border spinner-border-sm"></span> : 'Envoyer'}</button>
              <button className="btn btn-outline-secondary" onClick={() => setShowFacture(false)}>Annuler</button>
            </div>
          </div>
        )}

        {/* Formulaire Vente */}
        {showVente && (
          <div className="mt-3 p-3 rounded" style={{ background: 'white', border: '1px solid #bbf7d0' }}>
            <h6 className="mb-3"><i className="bi bi-trophy-fill me-2" style={{ color: '#16a34a' }}></i>Déclarer une vente signée</h6>
            <div className="mb-2"><input type="text" className="form-control" placeholder="Nom de la société" value={venteSociete} onChange={e => setVenteSociete(e.target.value)} /></div>
            <div className="mb-2">
              <select className="form-select" value={venteFournisseur} onChange={e => setVenteFournisseur(e.target.value)}>
                <option value="">-- Fournisseur --</option><option value="EDF">EDF</option><option value="Engie">Engie</option><option value="TotalEnergies">TotalEnergies</option><option value="Vattenfall">Vattenfall</option><option value="Eni">Eni</option><option value="OHM Énergie">OHM Énergie</option><option value="Ekwateur">Ekwateur</option><option value="Alpiq">Alpiq</option><option value="Primeo">Primeo</option><option value="Octopus">Octopus</option><option value="GazelEnergie">GazelEnergie</option><option value="Autre">Autre</option>
              </select>
            </div>
            <div className="mb-3">
              <select className="form-select" value={venteSegment} onChange={e => setVenteSegment(e.target.value)}>
                <option value="C5">C5 (Bleu) - &lt; 36 kVA</option><option value="C4">C4 (Jaune) - 36 à 250 kVA</option><option value="C3">C3 (Vert) - &gt; 250 kVA</option><option value="Gaz">Gaz</option>
              </select>
            </div>
            <div className="d-flex gap-2">
              <button className="btn text-white" style={{ background: '#16a34a', border: 'none' }} onClick={handleVente} disabled={loading || !venteSociete.trim() || !venteFournisseur}>{loading ? <span className="spinner-border spinner-border-sm"></span> : 'Déclarer la vente !'}</button>
              <button className="btn btn-outline-secondary" onClick={() => setShowVente(false)}>Annuler</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
