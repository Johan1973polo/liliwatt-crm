'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Vendor {
  id: string;
  email: string;
}

type RequestType = 'DATA_BASE' | 'INVOICE' | 'INTEGRATION' | 'PROBLEME_TECHNIQUE' | 'SOUTIEN_TECHNIQUE' | 'FIN_COLLABORATION';

export default function ReferentDemandesForm({
  referentId,
  vendors,
}: {
  referentId: string;
  vendors: Vendor[];
}) {
  const router = useRouter();
  const [requestType, setRequestType] = useState<RequestType>('DATA_BASE');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Champs pour l'intégration
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

      if (requestType === 'INVOICE' && selectedVendor) {
        payload.vendorEmail = vendors.find(v => v.id === selectedVendor)?.email;
      }

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
        alert('✅ Demande envoyée avec succès !');
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
        alert(`❌ Erreur : ${data.error}`);
      }
    } catch (error) {
      alert('❌ Erreur lors de l\'envoi de la demande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title mb-4">
          <i className="bi bi-clipboard-check me-2"></i>
          Nouvelle demande
        </h5>

        <form onSubmit={handleSubmit}>
          {/* Sélection du type de demande avec code couleur */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Type de demande</label>

            {/* Première ligne - 3 boutons */}
            <div className="d-grid gap-2 d-md-flex mb-2">
              <input
                type="radio"
                className="btn-check"
                name="requestType"
                id="typeDataBase"
                checked={requestType === 'DATA_BASE'}
                onChange={() => setRequestType('DATA_BASE')}
              />
              <label className="btn btn-outline-success flex-fill" htmlFor="typeDataBase">
                <i className="bi bi-database me-2"></i>
                Demande de base
              </label>

              <input
                type="radio"
                className="btn-check"
                name="requestType"
                id="typeInvoice"
                checked={requestType === 'INVOICE'}
                onChange={() => setRequestType('INVOICE')}
              />
              <label className="btn btn-outline-warning flex-fill" htmlFor="typeInvoice">
                <i className="bi bi-receipt me-2"></i>
                Demande de facture
              </label>

              <input
                type="radio"
                className="btn-check"
                name="requestType"
                id="typeIntegration"
                checked={requestType === 'INTEGRATION'}
                onChange={() => setRequestType('INTEGRATION')}
              />
              <label className="btn btn-outline-primary flex-fill" htmlFor="typeIntegration">
                <i className="bi bi-person-plus me-2"></i>
                Intégration
              </label>
            </div>

            {/* Deuxième ligne - 3 boutons */}
            <div className="d-grid gap-2 d-md-flex mb-2">
              <input
                type="radio"
                className="btn-check"
                name="requestType"
                id="typeProbleme"
                checked={requestType === 'PROBLEME_TECHNIQUE'}
                onChange={() => setRequestType('PROBLEME_TECHNIQUE')}
              />
              <label className="btn btn-outline-danger flex-fill" htmlFor="typeProbleme">
                <i className="bi bi-tools me-2"></i>
                Problème technique
              </label>

              <input
                type="radio"
                className="btn-check"
                name="requestType"
                id="typeSoutien"
                checked={requestType === 'SOUTIEN_TECHNIQUE'}
                onChange={() => setRequestType('SOUTIEN_TECHNIQUE')}
              />
              <label className="btn btn-outline-secondary flex-fill" htmlFor="typeSoutien">
                <i className="bi bi-question-circle me-2"></i>
                Soutien technique
              </label>

              <input
                type="radio"
                className="btn-check"
                name="requestType"
                id="typeFinCollaboration"
                checked={requestType === 'FIN_COLLABORATION'}
                onChange={() => setRequestType('FIN_COLLABORATION')}
              />
              <label className="btn btn-outline-dark flex-fill" htmlFor="typeFinCollaboration">
                <i className="bi bi-x-circle me-2"></i>
                Fin de collaboration
              </label>
            </div>
          </div>

          {/* Sélection du vendeur concerné (pour tous les types sauf INTEGRATION) */}
          {requestType !== 'INTEGRATION' && (
            <div className="mb-3">
              <label htmlFor="vendor" className="form-label fw-semibold">
                <i className="bi bi-person me-2"></i>
                {requestType === 'FIN_COLLABORATION' ? 'Vendeur concerné par la fin de collaboration *' : 'Concerné *'}
              </label>
              <select
                id="vendor"
                className="form-select"
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                required
                disabled={loading}
              >
                <option value="">Sélectionnez une personne</option>
                {/* Moi-même pour tous les types sauf FIN_COLLABORATION */}
                {requestType !== 'FIN_COLLABORATION' && (
                  <option value="myself">Moi-même</option>
                )}
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Champs pour l'intégration */}
          {requestType === 'INTEGRATION' && (
            <>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="recrueName" className="form-label fw-semibold">
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="recrueName"
                    className="form-control"
                    value={recrueName}
                    onChange={(e) => setRecrueName(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Nom de la recrue"
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="recrueFirstName" className="form-label fw-semibold">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="recrueFirstName"
                    className="form-control"
                    value={recrueFirstName}
                    onChange={(e) => setRecrueFirstName(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Prénom de la recrue"
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label htmlFor="recruePhone" className="form-label fw-semibold">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    id="recruePhone"
                    className="form-control"
                    value={recruePhone}
                    onChange={(e) => setRecruePhone(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="06 XX XX XX XX"
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="recrueEmail" className="form-label fw-semibold">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="recrueEmail"
                    className="form-control"
                    value={recrueEmail}
                    onChange={(e) => setRecrueEmail(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="email@exemple.fr"
                  />
                </div>
              </div>

              {/* Checkbox assistance micro-entreprise */}
              <div className="mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="microEntrepriseAssistance"
                    checked={microEntrepriseAssistance}
                    onChange={(e) => setMicroEntrepriseAssistance(e.target.checked)}
                    disabled={loading}
                  />
                  <label className="form-check-label" htmlFor="microEntrepriseAssistance">
                    <i className="bi bi-building me-2"></i>
                    Assistance à la création et à l&apos;immatriculation d&apos;une micro-entreprise
                  </label>
                </div>
              </div>
            </>
          )}

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="form-label fw-semibold">
              <i className="bi bi-chat-left-text me-2"></i>
              {requestType === 'FIN_COLLABORATION' ? 'Raison de la fin de collaboration *' : 'Description / Commentaire'}
              {requestType !== 'INVOICE' && requestType !== 'INTEGRATION' && ' *'}
            </label>
            <textarea
              id="description"
              className="form-control"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required={requestType !== 'INVOICE' && requestType !== 'INTEGRATION'}
              disabled={loading}
              placeholder={
                requestType === 'DATA_BASE'
                  ? 'Ex: Besoin de la base télépro pour la région Île-de-France'
                  : requestType === 'INVOICE'
                  ? 'Commentaire optionnel...'
                  : requestType === 'INTEGRATION'
                  ? 'Informations complémentaires (optionnel)...'
                  : requestType === 'PROBLEME_TECHNIQUE'
                  ? 'Ex: Ma vendeuse Gaël a un souci de connexion'
                  : requestType === 'FIN_COLLABORATION'
                  ? 'Ex: Non-respect des objectifs, abandon du poste, etc.'
                  : 'Ex: J\'ai besoin d\'aide pour identifier une facture'
              }
            />
          </div>

          {/* Bouton d'envoi */}
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading || (requestType !== 'INTEGRATION' && !selectedVendor)}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Envoi en cours...
              </>
            ) : (
              <>
                <i className="bi bi-send me-2"></i>
                Envoyer la demande
              </>
            )}
          </button>
        </form>

        {/* Informations */}
        <div className={`alert mt-4 mb-0 ${
          requestType === 'DATA_BASE' ? 'alert-success' :
          requestType === 'INVOICE' ? 'alert-warning' :
          requestType === 'INTEGRATION' ? 'alert-primary' :
          requestType === 'PROBLEME_TECHNIQUE' ? 'alert-danger' :
          requestType === 'FIN_COLLABORATION' ? 'alert-dark' :
          'alert-secondary'
        }`}>
          <i className="bi bi-info-circle me-2"></i>
          <small>
            {requestType === 'DATA_BASE' && 'Votre demande de base de données sera traitée par le back-office.'}
            {requestType === 'INVOICE' && 'Votre demande de facture sera traitée par le back-office.'}
            {requestType === 'INTEGRATION' && 'Votre demande d\'intégration sera traitée par le back-office.'}
            {requestType === 'PROBLEME_TECHNIQUE' && 'Votre problème technique sera traité par le back-office.'}
            {requestType === 'FIN_COLLABORATION' && 'Votre demande de fin de collaboration sera traitée par le back-office.'}
            {requestType === 'SOUTIEN_TECHNIQUE' && 'Votre demande de soutien sera traitée par un administrateur.'}
          </small>
        </div>
      </div>
    </div>
  );
}
