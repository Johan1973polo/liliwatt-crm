'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RequestsBlock({ referentId }: { referentId: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // État pour la demande de base
  const [baseDescription, setBaseDescription] = useState('');

  // État pour la demande financière
  const [financialData, setFinancialData] = useState({
    siren: '',
    raisonSociale: '',
    commentaire: '',
  });

  const handleDataBaseRequest = async () => {
    if (!baseDescription.trim()) {
      alert('Veuillez décrire votre demande');
      return;
    }

    if (!referentId) {
      alert('Vous n&apos;avez pas de référent assigné');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'DATA_BASE',
          referentId,
          payload: { description: baseDescription },
        }),
      });

      if (response.ok) {
        setBaseDescription('');
        alert('Demande envoyée avec succès');
        router.refresh();
      } else {
        alert('Erreur lors de l&apos;envoi de la demande');
      }
    } catch (error) {
      alert('Erreur lors de l\'envoi de la demande');
    } finally {
      setLoading(false);
    }
  };

  const handleFinancialRequest = async () => {
    if (!financialData.siren.trim() || !financialData.raisonSociale.trim()) {
      alert('Veuillez remplir au moins le SIREN et la raison sociale');
      return;
    }

    if (!referentId) {
      alert('Vous n&apos;avez pas de référent assigné');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'FINANCIAL_RATING',
          referentId,
          payload: financialData,
        }),
      });

      if (response.ok) {
        setFinancialData({ siren: '', raisonSociale: '', commentaire: '' });
        alert('Demande envoyée avec succès');
        router.refresh();
      } else {
        alert('Erreur lors de l&apos;envoi de la demande');
      }
    } catch (error) {
      alert('Erreur lors de l\'envoi de la demande');
    } finally {
      setLoading(false);
    }
  };

  if (!referentId) {
    return (
      <div className="card mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">
            <i className="bi bi-envelope-paper me-2"></i>
            Demandes
          </h5>
        </div>
        <div className="card-body">
          <p className="text-muted mb-0">Vous n&apos;avez pas de référent assigné.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-4">
      <div className="card-header bg-white">
        <h5 className="mb-0">
          <i className="bi bi-envelope-paper me-2"></i>
          Demandes
        </h5>
      </div>
      <div className="card-body">
        {/* Demande de base télépro */}
        <div className="mb-4 pb-4 border-bottom bg-success bg-opacity-10 p-3 rounded">
          <h6 className="mb-3">
            <i className="bi bi-database me-2"></i>
            Demande de donnée base télépro
          </h6>
          <textarea
            className="form-control mb-3"
            rows={3}
            placeholder="Décrivez votre demande (ex: Base Île-de-France secteur BTP)..."
            value={baseDescription}
            onChange={(e) => setBaseDescription(e.target.value)}
            disabled={loading}
          ></textarea>
          <button
            onClick={handleDataBaseRequest}
            className="btn btn-primary w-100"
            disabled={loading || !baseDescription.trim()}
          >
            <i className="bi bi-send me-2"></i>
            Envoyer la demande
          </button>
        </div>

        {/* Demande de note financière */}
        <div className="bg-warning bg-opacity-10 p-3 rounded">
          <h6 className="mb-3">
            <i className="bi bi-cash-coin me-2"></i>
            Demande de note financière
          </h6>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="SIREN"
              value={financialData.siren}
              onChange={(e) =>
                setFinancialData({ ...financialData, siren: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Raison sociale"
              value={financialData.raisonSociale}
              onChange={(e) =>
                setFinancialData({ ...financialData, raisonSociale: e.target.value })
              }
              disabled={loading}
            />
          </div>
          <div className="mb-3">
            <textarea
              className="form-control"
              rows={2}
              placeholder="Commentaire (optionnel)"
              value={financialData.commentaire}
              onChange={(e) =>
                setFinancialData({ ...financialData, commentaire: e.target.value })
              }
              disabled={loading}
            ></textarea>
          </div>
          <button
            onClick={handleFinancialRequest}
            className="btn btn-primary w-100"
            disabled={
              loading ||
              !financialData.siren.trim() ||
              !financialData.raisonSociale.trim()
            }
          >
            <i className="bi bi-send me-2"></i>
            Envoyer la demande
          </button>
        </div>
      </div>
    </div>
  );
}
