'use client';

import { useState } from 'react';

export default function DemandesBlock({ userRole, userEmail, userPrenom, userNom }: {
  userRole: string; userEmail: string; userPrenom: string; userNom: string;
}) {
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Parrainage state
  const [pPrenom, setPPrenom] = useState('');
  const [pNom, setPNom] = useState('');
  const [pTel, setPTel] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pMotiv, setPMotiv] = useState('');

  // Carte state
  const [cPoste, setCPoste] = useState('Courtier en énergie');
  const [cPosteAutre, setCPosteAutre] = useState('');
  const [cTel, setCTel] = useState('');
  const [cRue, setCRue] = useState('');
  const [cCp, setCCp] = useState('');
  const [cVille, setCVille] = useState('');
  const [cComplement, setCComplement] = useState('');

  // Fin collab state
  const [fVendeur, setFVendeur] = useState('');
  const [fDate, setFDate] = useState('');
  const [fMotif, setFMotif] = useState('Démission du vendeur');
  const [fMotifAutre, setFMotifAutre] = useState('');
  const [fComment, setFComment] = useState('');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  const loadTeam = async () => {
    try {
      const r = await fetch('/api/team-status');
      if (r.ok) setTeamMembers(await r.json());
    } catch {}
  };

  const submit = async (url: string, body: any, msg: string) => {
    setLoading(true);
    try {
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (r.ok) { setSuccess(msg); setActiveForm(null); setTimeout(() => setSuccess(''), 4000); }
      else { const d = await r.json(); alert('Erreur: ' + (d.error || 'Inconnue')); }
    } catch { alert('Erreur réseau'); }
    setLoading(false);
  };

  const isRef = userRole === 'REFERENT' || userRole === 'ADMIN';

  return (
    <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '20px', border: '1px solid #e9d5ff' }}>
      <div style={{ background: '#7c3aed', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }}></span>
        <span style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>📋 Mes demandes</span>
      </div>
      <div style={{ background: 'white', padding: '20px' }}>
        {success && <div className="alert alert-success py-2 mb-3"><i className="bi bi-check-circle me-2"></i>{success}</div>}

        {/* Boutons types */}
        <div style={{ display: 'grid', gridTemplateColumns: isRef ? '1fr 1fr 1fr' : '1fr 1fr', gap: '10px', marginBottom: activeForm ? '16px' : '0' }}>
          <button onClick={() => setActiveForm(activeForm === 'parrainage' ? null : 'parrainage')} style={{ background: activeForm === 'parrainage' ? '#166534' : '#16a34a', color: 'white', border: 'none', borderRadius: '10px', padding: '14px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
            🤝 Parrainage
          </button>
          <button onClick={() => setActiveForm(activeForm === 'carte' ? null : 'carte')} style={{ background: activeForm === 'carte' ? '#5b21b6' : '#7c3aed', color: 'white', border: 'none', borderRadius: '10px', padding: '14px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
            💳 Carte de visite
          </button>
          {isRef && (
            <button onClick={() => { setActiveForm(activeForm === 'fin' ? null : 'fin'); loadTeam(); }} style={{ background: activeForm === 'fin' ? '#c2410c' : '#ea580c', color: 'white', border: 'none', borderRadius: '10px', padding: '14px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
              👋 Fin de collaboration
            </button>
          )}
        </div>

        {/* Formulaire Parrainage */}
        {activeForm === 'parrainage' && (
          <div className="p-3 rounded" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <h6 className="mb-3" style={{ color: '#166534' }}>🤝 Parrainer un candidat</h6>
            <div className="row g-2 mb-2">
              <div className="col-6"><input className="form-control" placeholder="Prénom" value={pPrenom} onChange={e => setPPrenom(e.target.value)} /></div>
              <div className="col-6"><input className="form-control" placeholder="Nom" value={pNom} onChange={e => setPNom(e.target.value)} /></div>
            </div>
            <div className="row g-2 mb-2">
              <div className="col-6"><input className="form-control" placeholder="Téléphone" value={pTel} onChange={e => setPTel(e.target.value)} /></div>
              <div className="col-6"><input className="form-control" type="email" placeholder="Email" value={pEmail} onChange={e => setPEmail(e.target.value)} /></div>
            </div>
            <textarea className="form-control mb-3" rows={3} placeholder="Pourquoi recommandez-vous cette personne ?" value={pMotiv} onChange={e => setPMotiv(e.target.value)} />
            <button className="btn text-white w-100" style={{ background: '#16a34a', border: 'none', height: '48px', fontWeight: 700 }} disabled={loading || !pPrenom || !pNom || !pTel || !pEmail}
              onClick={() => submit('/api/demandes/parrainage', { prenom: pPrenom, nom: pNom, telephone: pTel, email: pEmail, motivation: pMotiv }, 'Recommandation envoyée !')}>
              {loading ? 'Envoi...' : '✉️ Envoyer la recommandation'}
            </button>
          </div>
        )}

        {/* Formulaire Carte de visite */}
        {activeForm === 'carte' && (
          <div className="p-3 rounded" style={{ background: '#f5f3ff', border: '1px solid #e9d5ff' }}>
            <div style={{ background: 'linear-gradient(135deg,#7c3aed,#d946ef)', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '24px' }}>ℹ️</span>
              <div style={{ color: 'white' }}>
                <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '14px' }}>Cartes réservées aux courtiers en activité</p>
                <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.5, color: 'rgba(255,255,255,0.9)' }}>Les cartes de visite LILIWATT sont exclusivement réservées aux courtiers ayant concrétisé leur première vente.</p>
              </div>
            </div>
            <div className="row g-2 mb-2">
              <div className="col-6"><input className="form-control" placeholder="Prénom" defaultValue={userPrenom} /></div>
              <div className="col-6"><input className="form-control" placeholder="Nom" defaultValue={userNom} /></div>
            </div>
            <select className="form-select mb-2" value={cPoste} onChange={e => setCPoste(e.target.value)}>
              <option>Courtier en énergie</option><option>Expert en énergie</option><option>Conseiller en énergie</option><option value="autre">Autre</option>
            </select>
            {cPoste === 'autre' && <input className="form-control mb-2" placeholder="Poste souhaité" value={cPosteAutre} onChange={e => setCPosteAutre(e.target.value)} />}
            <input className="form-control mb-2" placeholder="Téléphone (sur la carte)" value={cTel} onChange={e => setCTel(e.target.value)} />
            <h6 className="mt-3 mb-2" style={{ fontSize: '13px', color: '#6b7280' }}>Adresse de livraison</h6>
            <input className="form-control mb-2" placeholder="Rue + numéro" value={cRue} onChange={e => setCRue(e.target.value)} />
            <div className="row g-2 mb-2">
              <div className="col-4"><input className="form-control" placeholder="Code postal" value={cCp} onChange={e => setCCp(e.target.value)} /></div>
              <div className="col-8"><input className="form-control" placeholder="Ville" value={cVille} onChange={e => setCVille(e.target.value)} /></div>
            </div>
            <input className="form-control mb-3" placeholder="Complément (optionnel)" value={cComplement} onChange={e => setCComplement(e.target.value)} />
            <button className="btn text-white w-100" style={{ background: '#7c3aed', border: 'none', height: '48px', fontWeight: 700 }} disabled={loading || !cTel || !cRue || !cVille}
              onClick={() => submit('/api/demandes/carte-visite', { prenom: userPrenom, nom: userNom, poste: cPoste === 'autre' ? cPosteAutre : cPoste, telephone: cTel, email_carte: userEmail, adresse: { rue: cRue, cp: cCp, ville: cVille, complement: cComplement } }, 'Demande de carte envoyée !')}>
              {loading ? 'Envoi...' : '✉️ Envoyer la demande'}
            </button>
          </div>
        )}

        {/* Formulaire Fin collaboration */}
        {activeForm === 'fin' && (
          <div className="p-3 rounded" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
            <h6 className="mb-3" style={{ color: '#c2410c' }}>👋 Fin de collaboration</h6>
            <select className="form-select mb-2" value={fVendeur} onChange={e => setFVendeur(e.target.value)}>
              <option value="">-- Sélectionner un vendeur --</option>
              {teamMembers.map(m => <option key={m.id} value={m.email}>{m.firstName} {m.lastName} ({m.email})</option>)}
            </select>
            <input type="date" className="form-control mb-2" value={fDate} onChange={e => setFDate(e.target.value)} />
            <select className="form-select mb-2" value={fMotif} onChange={e => setFMotif(e.target.value)}>
              <option>Démission du vendeur</option><option>Rupture à l&apos;initiative LILIWATT</option><option>Fin de période d&apos;essai</option><option>Inactivité prolongée</option><option value="autre">Autre</option>
            </select>
            {fMotif === 'autre' && <input className="form-control mb-2" placeholder="Précisez le motif" value={fMotifAutre} onChange={e => setFMotifAutre(e.target.value)} />}
            <textarea className="form-control mb-3" rows={4} placeholder="Commentaire..." value={fComment} onChange={e => setFComment(e.target.value)} />
            <button className="btn text-white w-100" style={{ background: '#ea580c', border: 'none', height: '48px', fontWeight: 700 }} disabled={loading || !fVendeur || !fDate}
              onClick={() => submit('/api/demandes/fin-collaboration', { vendeur_email: fVendeur, vendeur_nom: teamMembers.find(m => m.email === fVendeur)?.firstName || '', date_fin: fDate, motif: fMotif === 'autre' ? fMotifAutre : fMotif, commentaire: fComment }, 'Fin de collaboration signalée !')}>
              {loading ? 'Envoi...' : '✉️ Signaler la fin'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
