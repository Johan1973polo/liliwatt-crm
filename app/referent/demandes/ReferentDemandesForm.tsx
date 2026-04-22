'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Vendor {
  id: string;
  email: string;
}

const TYPES_DEMANDE = [
  {
    id: 'INTEGRATION',
    label: 'Integration nouveau vendeur',
    icon: 'bi-person-plus',
    color: '#7c3aed',
    bg: '#f5f3ff',
    description: 'Integrer un nouveau vendeur dans votre equipe',
  },
  {
    id: 'FIN_COLLABORATION',
    label: 'Fin de collaboration',
    icon: 'bi-x-circle',
    color: '#ea580c',
    bg: '#fff7ed',
    description: 'Mettre fin a la collaboration avec un vendeur',
  },
  {
    id: 'DEMANDE_ADMIN',
    label: 'Demande administrative',
    icon: 'bi-clipboard2-check',
    color: '#059669',
    bg: '#ecfdf5',
    description: 'Autres demandes administratives',
  },
] as const;

type RequestType = typeof TYPES_DEMANDE[number]['id'];

export default function ReferentDemandesForm({
  referentId,
  vendors,
}: {
  referentId: string;
  vendors: Vendor[];
}) {
  const router = useRouter();
  const [requestType, setRequestType] = useState<RequestType>('INTEGRATION');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Champs integration
  const [recrueName, setRecrueName] = useState('');
  const [recrueFirstName, setRecrueFirstName] = useState('');
  const [recruePhone, setRecruePhone] = useState('');
  const [recrueEmail, setRecrueEmail] = useState('');
  const [microEntrepriseAssistance, setMicroEntrepriseAssistance] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: Record<string, any> = { description };

      if (requestType === 'INTEGRATION') {
        payload.recrueName = recrueName;
        payload.recrueFirstName = recrueFirstName;
        payload.recruePhone = recruePhone;
        payload.recrueEmail = recrueEmail;
        payload.microEntrepriseAssistance = microEntrepriseAssistance;
      }

      if (requestType === 'FIN_COLLABORATION' && selectedVendor) {
        payload.vendorEmail = vendors.find(v => v.id === selectedVendor)?.email;
      }

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: requestType,
          referentId,
          vendorId: (selectedVendor && selectedVendor !== 'myself') ? selectedVendor : null,
          payload,
        }),
      });

      if (response.ok) {
        alert('Demande envoyee avec succes !');
        setDescription('');
        setSelectedVendor('');
        setRecrueName('');
        setRecrueFirstName('');
        setRecruePhone('');
        setRecrueEmail('');
        setMicroEntrepriseAssistance(false);
        router.refresh();
      } else {
        const data = await response.json();
        alert(`Erreur : ${data.error}`);
      }
    } catch {
      alert('Erreur lors de l\'envoi de la demande');
    } finally {
      setLoading(false);
    }
  };

  const activeType = TYPES_DEMANDE.find(t => t.id === requestType)!;

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title mb-4">
          <i className="bi bi-clipboard-check me-2"></i>
          Nouvelle demande
        </h5>

        <form onSubmit={handleSubmit}>
          {/* Selection du type - 3 cartes */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Type de demande</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {TYPES_DEMANDE.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setRequestType(type.id)}
                  style={{
                    background: requestType === type.id ? type.bg : 'white',
                    border: `2px solid ${requestType === type.id ? type.color : '#e5e7eb'}`,
                    borderRadius: '12px',
                    padding: '20px 16px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <i className={`${type.icon}`} style={{ fontSize: '24px', color: type.color, display: 'block', marginBottom: '8px' }}></i>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e1b4b', marginBottom: '4px' }}>{type.label}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Champs integration */}
          {requestType === 'INTEGRATION' && (
            <>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="recrueName" className="form-label fw-semibold">Nom *</label>
                  <input type="text" id="recrueName" className="form-control" value={recrueName}
                    onChange={(e) => setRecrueName(e.target.value)} required disabled={loading} placeholder="Nom de la recrue" />
                </div>
                <div className="col-md-6">
                  <label htmlFor="recrueFirstName" className="form-label fw-semibold">Prenom *</label>
                  <input type="text" id="recrueFirstName" className="form-control" value={recrueFirstName}
                    onChange={(e) => setRecrueFirstName(e.target.value)} required disabled={loading} placeholder="Prenom de la recrue" />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="recruePhone" className="form-label fw-semibold">Telephone *</label>
                  <input type="tel" id="recruePhone" className="form-control" value={recruePhone}
                    onChange={(e) => setRecruePhone(e.target.value)} required disabled={loading} placeholder="06 XX XX XX XX" />
                </div>
                <div className="col-md-6">
                  <label htmlFor="recrueEmail" className="form-label fw-semibold">Email *</label>
                  <input type="email" id="recrueEmail" className="form-control" value={recrueEmail}
                    onChange={(e) => setRecrueEmail(e.target.value)} required disabled={loading} placeholder="email@exemple.fr" />
                </div>
              </div>
              <div className="mb-3">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="microEntrepriseAssistance"
                    checked={microEntrepriseAssistance} onChange={(e) => setMicroEntrepriseAssistance(e.target.checked)} disabled={loading} />
                  <label className="form-check-label" htmlFor="microEntrepriseAssistance">
                    <i className="bi bi-building me-2"></i>
                    Assistance a la creation et a l&apos;immatriculation d&apos;une micro-entreprise
                  </label>
                </div>
              </div>
            </>
          )}

          {/* Vendeur concerne (fin de collaboration) */}
          {requestType === 'FIN_COLLABORATION' && (
            <div className="mb-3">
              <label htmlFor="vendor" className="form-label fw-semibold">
                <i className="bi bi-person me-2"></i>Vendeur concerne *
              </label>
              <select id="vendor" className="form-select" value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)} required disabled={loading}>
                <option value="">Selectionnez un vendeur</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>{vendor.email}</option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="form-label fw-semibold">
              <i className="bi bi-chat-left-text me-2"></i>
              {requestType === 'FIN_COLLABORATION' ? 'Raison de la fin de collaboration *' :
               requestType === 'INTEGRATION' ? 'Informations complementaires (optionnel)' :
               'Description de votre demande *'}
            </label>
            <textarea id="description" className="form-control" rows={4} value={description}
              onChange={(e) => setDescription(e.target.value)}
              required={requestType !== 'INTEGRATION'}
              disabled={loading}
              placeholder={
                requestType === 'INTEGRATION' ? 'Informations complementaires...' :
                requestType === 'FIN_COLLABORATION' ? 'Ex: Non-respect des objectifs, abandon du poste, etc.' :
                'Decrivez votre demande administrative...'
              }
            />
          </div>

          {/* Bouton envoi */}
          <button type="submit" className="btn btn-lg w-100" disabled={loading || (requestType === 'FIN_COLLABORATION' && !selectedVendor)}
            style={{ background: activeType.color, color: 'white', fontWeight: 700, border: 'none' }}>
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2" />Envoi en cours...</>
            ) : (
              <><i className="bi bi-send me-2"></i>Envoyer la demande</>
            )}
          </button>
        </form>

        <div className="alert mt-4 mb-0" style={{ background: activeType.bg, border: `1px solid ${activeType.color}30` }}>
          <i className="bi bi-info-circle me-2" style={{ color: activeType.color }}></i>
          <small style={{ color: '#4b5563' }}>
            Votre demande sera traitee par l&apos;equipe LILIWATT dans les meilleurs delais.
          </small>
        </div>
      </div>
    </div>
  );
}
