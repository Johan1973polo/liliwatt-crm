'use client';

import { useState } from 'react';

export default function DeclarationButtons() {
  const [showFacture, setShowFacture] = useState(false);
  const [showVente, setShowVente] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Facture form
  const [facSociete, setFacSociete] = useState('');
  const [facType, setFacType] = useState('electricite');
  const [facNotes, setFacNotes] = useState('');

  // Vente form
  const [venteSociete, setVenteSociete] = useState('');
  const [venteFournisseur, setVenteFournisseur] = useState('');
  const [venteSegment, setVenteSegment] = useState('C5');

  const handleFacture = async () => {
    if (!facSociete.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/declarations/facture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ societe: facSociete, type: facType, notes: facNotes }),
      });
      if (res.ok) {
        setSuccess('Facture déclarée avec succès !');
        setShowFacture(false);
        setFacSociete('');
        setFacNotes('');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleVente = async () => {
    if (!venteSociete.trim() || !venteFournisseur.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/declarations/vente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ societe: venteSociete, fournisseur: venteFournisseur, segment: venteSegment }),
      });
      if (res.ok) {
        setSuccess('Vente déclarée ! Toute l\'équipe a été notifiée !');
        setShowVente(false);
        setVenteSociete('');
        setVenteFournisseur('');
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="card mb-4">
      <div className="card-header bg-white">
        <h5 className="mb-0">
          <i className="bi bi-megaphone-fill me-2 text-primary"></i>
          Annonces à l&apos;équipe
        </h5>
        <small className="text-muted">Partagez vos réussites avec toute l&apos;équipe !</small>
      </div>
      <div className="card-body">
        {success && (
          <div className="alert alert-success py-2 mb-3">
            <i className="bi bi-check-circle me-2"></i>{success}
          </div>
        )}

        <div className="d-flex flex-column gap-3">
          <button
            className="btn text-white py-3 w-100"
            onClick={() => { setShowFacture(true); setShowVente(false); }}
            style={{ fontSize: '1.1rem', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: '12px' }}
          >
            <i className="bi bi-bell-fill me-2"></i>
            J&apos;ai récupéré une facture !
          </button>
          <button
            className="btn text-white py-3 w-100"
            onClick={() => { setShowVente(true); setShowFacture(false); }}
            style={{ fontSize: '1.1rem', background: 'linear-gradient(135deg, #d946ef, #7c3aed)', border: 'none', borderRadius: '12px' }}
          >
            <i className="bi bi-trophy-fill me-2"></i>
            J&apos;ai signé un client !
          </button>
        </div>

        {/* Formulaire Facture */}
        {showFacture && (
          <div className="mt-3 p-3 rounded" style={{ background: '#f8f5ff', border: '1px solid #e9d5ff' }}>
            <h6 className="mb-3"><i className="bi bi-bell-fill me-2 text-primary"></i>Déclarer une facture récupérée</h6>
            <div className="mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="Nom de la société"
                value={facSociete}
                onChange={(e) => setFacSociete(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <select className="form-select" value={facType} onChange={(e) => setFacType(e.target.value)}>
                <option value="electricite">Électricité</option>
                <option value="gaz">Gaz</option>
                <option value="les_deux">Électricité + Gaz</option>
              </select>
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Notes (optionnel)"
                value={facNotes}
                onChange={(e) => setFacNotes(e.target.value)}
              />
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={handleFacture} disabled={loading || !facSociete.trim()}>
                {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Envoyer'}
              </button>
              <button className="btn btn-outline-secondary" onClick={() => setShowFacture(false)}>Annuler</button>
            </div>
          </div>
        )}

        {/* Formulaire Vente */}
        {showVente && (
          <div className="mt-3 p-3 rounded" style={{ background: 'linear-gradient(135deg, #fdf4ff, #f5f3ff)', border: '1px solid #e9d5ff' }}>
            <h6 className="mb-3"><i className="bi bi-trophy-fill me-2" style={{ color: '#d946ef' }}></i>Déclarer une vente signée</h6>
            <div className="mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="Nom de la société"
                value={venteSociete}
                onChange={(e) => setVenteSociete(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <select className="form-select" value={venteFournisseur} onChange={(e) => setVenteFournisseur(e.target.value)}>
                <option value="">-- Fournisseur --</option>
                <option value="EDF">EDF</option>
                <option value="Engie">Engie</option>
                <option value="TotalEnergies">TotalEnergies</option>
                <option value="Vattenfall">Vattenfall</option>
                <option value="Eni">Eni</option>
                <option value="OHM Énergie">OHM Énergie</option>
                <option value="Ekwateur">Ekwateur</option>
                <option value="Alpiq">Alpiq</option>
                <option value="Primeo">Primeo</option>
                <option value="Octopus">Octopus</option>
                <option value="GazelEnergie">GazelEnergie</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div className="mb-3">
              <select className="form-select" value={venteSegment} onChange={(e) => setVenteSegment(e.target.value)}>
                <option value="C5">C5 (Bleu) - &lt; 36 kVA</option>
                <option value="C4">C4 (Jaune) - 36 à 250 kVA</option>
                <option value="C3">C3 (Vert) - &gt; 250 kVA</option>
                <option value="Gaz">Gaz</option>
              </select>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn text-white"
                style={{ background: 'linear-gradient(135deg, #d946ef, #7c3aed)', border: 'none' }}
                onClick={handleVente}
                disabled={loading || !venteSociete.trim() || !venteFournisseur}
              >
                {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Déclarer la vente !'}
              </button>
              <button className="btn btn-outline-secondary" onClick={() => setShowVente(false)}>Annuler</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
