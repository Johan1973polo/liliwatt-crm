'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ActivityForm() {
  const router = useRouter();
  const [type, setType] = useState('SALE');
  const [amount, setAmount] = useState('');
  const [courtierNumber, setCourtierNumber] = useState('');
  const [fictionalFirstName, setFictionalFirstName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'SALE' && !amount) {
      alert('Veuillez indiquer un montant pour une vente');
      return;
    }

    if (!courtierNumber) {
      alert('Veuillez indiquer un numéro de courtier');
      return;
    }

    if (!fictionalFirstName || !fictionalFirstName.trim()) {
      alert('Veuillez indiquer un prénom fictif');
      return;
    }

    const confirmed = confirm(
      `Êtes-vous sûr de vouloir créer cette activité fictive pour ${fictionalFirstName} (n°${courtierNumber}) ?`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch('/api/team-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          amount: amount ? parseInt(amount) : null,
          courtierNumber: parseInt(courtierNumber),
          fictionalFirstName: fictionalFirstName.trim(),
          message: null,
        }),
      });

      if (response.ok) {
        alert('✅ Activité fictive créée avec succès !');
        setAmount('');
        setCourtierNumber('');
        setFictionalFirstName('');
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la création de l\'activité');
      }
    } catch (error) {
      alert('Erreur lors de la création de l\'activité');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header bg-white">
        <h5 className="mb-0">
          <i className="bi bi-plus-circle me-2"></i>
          Créer une activité fictive
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {/* Type d'activité */}
          <div className="mb-4">
            <label className="form-label fw-semibold">
              <i className="bi bi-tag me-2"></i>
              Type d&apos;activité
            </label>
            <div className="btn-group w-100" role="group">
              <input
                type="radio"
                className="btn-check"
                name="type"
                id="type-sale"
                value="SALE"
                checked={type === 'SALE'}
                onChange={(e) => setType(e.target.value)}
              />
              <label className="btn btn-outline-success" htmlFor="type-sale">
                <i className="bi bi-cash-coin me-1"></i>
                Vente
              </label>

              <input
                type="radio"
                className="btn-check"
                name="type"
                id="type-invoice"
                value="INVOICE"
                checked={type === 'INVOICE'}
                onChange={(e) => setType(e.target.value)}
              />
              <label className="btn btn-outline-primary" htmlFor="type-invoice">
                <i className="bi bi-file-earmark-text me-1"></i>
                Facture récupérée
              </label>
            </div>
          </div>

          {/* Prénom fictif */}
          <div className="mb-4">
            <label htmlFor="fictionalFirstName" className="form-label fw-semibold">
              <i className="bi bi-person me-2"></i>
              Prénom fictif
            </label>
            <input
              type="text"
              id="fictionalFirstName"
              className="form-control"
              placeholder="Ex: Lucas"
              value={fictionalFirstName}
              onChange={(e) => setFictionalFirstName(e.target.value)}
              disabled={loading}
              required
            />
            <small className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              Ce prénom s&apos;affichera dans le fil d&apos;actualité
            </small>
          </div>

          {/* Numéro de courtier fictif */}
          <div className="mb-4">
            <label htmlFor="courtierNumber" className="form-label fw-semibold">
              <i className="bi bi-hash me-2"></i>
              Numéro de courtier fictif
            </label>
            <input
              type="number"
              id="courtierNumber"
              className="form-control"
              placeholder="Ex: 150"
              value={courtierNumber}
              onChange={(e) => setCourtierNumber(e.target.value)}
              disabled={loading}
              min="1"
              required
            />
            <small className="text-muted">
              <i className="bi bi-shield-check me-1"></i>
              Le système bloquera si ce numéro appartient à un vrai vendeur
            </small>
          </div>

          {/* Montant (seulement pour les ventes) */}
          {type === 'SALE' && (
            <div className="mb-4">
              <label htmlFor="amount" className="form-label fw-semibold">
                <i className="bi bi-currency-euro me-2"></i>
                Montant de la vente fictive (€)
              </label>
              <input
                type="number"
                id="amount"
                className="form-control"
                placeholder="Ex: 3500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
                min="1"
                step="1"
              />
              <small className="text-muted">
                Choisissez un montant crédible pour motiver l&apos;équipe
              </small>
            </div>
          )}

          {/* Aperçu */}
          <div className="alert alert-light border">
            <strong>
              <i className="bi bi-eye me-2"></i>
              Aperçu :
            </strong>
            <div className="mt-2">
              {fictionalFirstName && courtierNumber && type === 'SALE' && amount ? (
                <span>
                  💰 <strong>{fictionalFirstName}</strong> a réalisé une vente de{' '}
                  <strong>{parseInt(amount).toLocaleString('fr-FR')} €</strong>
                </span>
              ) : fictionalFirstName && courtierNumber && type === 'INVOICE' ? (
                <span>📄 <strong>{fictionalFirstName}</strong> vient de récupérer une facture !</span>
              ) : (
                <span className="text-muted">
                  Remplissez les champs pour voir l&apos;aperçu
                </span>
              )}
            </div>
          </div>

          {/* Bouton de soumission */}
          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading || !fictionalFirstName || !courtierNumber || (type === 'SALE' && !amount)}
            >
              <i className="bi bi-plus-circle me-2"></i>
              {loading ? 'Création en cours...' : 'Créer l\'activité'}
            </button>
          </div>
        </form>

        <div className="alert alert-warning mt-4 mb-0">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <strong>Note :</strong> Les activités fictives sont mélangées aux
          activités réelles pour motiver l&apos;équipe. Les vendeurs ne peuvent
          pas distinguer les vraies des fausses.
        </div>
      </div>
    </div>
  );
}
