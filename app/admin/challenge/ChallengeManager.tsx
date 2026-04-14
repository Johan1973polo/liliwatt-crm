'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ChallengeManagerProps {
  activeChallenge: {
    id: string;
    message: string;
    createdAt: Date;
  } | null;
}

export default function ChallengeManager({ activeChallenge }: ChallengeManagerProps) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Veuillez saisir un message');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        setMessage('');
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la création');
      }
    } catch (err) {
      setError('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Voulez-vous vraiment terminer ce challenge ? (Challenge gagné)')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/challenges', {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      } else {
        setError('Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row">
      <div className="col-md-6 mb-4">
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              <i className="bi bi-plus-circle me-2"></i>
              Créer un nouveau challenge
            </h5>
          </div>
          <div className="card-body">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate}>
              <div className="mb-3">
                <label htmlFor="message" className="form-label fw-semibold">
                  <i className="bi bi-megaphone me-2"></i>
                  Message du challenge
                </label>
                <textarea
                  className="form-control"
                  id="message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ex: Le premier à récupérer une facture aujourd'hui avant 10h à 100€ cash !"
                  disabled={loading}
                  required
                ></textarea>
                <small className="text-muted">
                  Soyez créatif ! Ce message sera affiché en gros et en gras chez tous les vendeurs
                </small>
              </div>

              <div className="d-grid">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading}
                >
                  <i className="bi bi-trophy me-2"></i>
                  {loading ? 'Création...' : 'Lancer le challenge'}
                </button>
              </div>
            </form>

            <div className="alert alert-info mt-4 mb-0">
              <i className="bi bi-info-circle me-2"></i>
              <strong>Note :</strong> Créer un nouveau challenge remplacera automatiquement le challenge actuel.
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-6">
        <div className="card">
          <div className="card-header bg-white">
            <h5 className="mb-0">
              <i className="bi bi-trophy me-2"></i>
              Challenge actif
            </h5>
          </div>
          <div className="card-body">
            {activeChallenge ? (
              <>
                <div className="alert alert-warning mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-megaphone-fill me-2" style={{ fontSize: '1.5rem' }}></i>
                    <h5 className="mb-0">CHALLENGE DU JOUR</h5>
                  </div>
                  <p className="mb-0 fs-5 fw-bold">
                    {activeChallenge.message}
                  </p>
                </div>

                <div className="mb-3">
                  <small className="text-muted">
                    <i className="bi bi-clock me-1"></i>
                    Créé le {new Date(activeChallenge.createdAt).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </small>
                </div>

                <button
                  onClick={handleDelete}
                  className="btn btn-danger w-100"
                  disabled={loading}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  {loading ? 'Suppression...' : 'Challenge gagné / Terminer'}
                </button>

                <div className="alert alert-success mt-3 mb-0">
                  <i className="bi bi-check-circle me-2"></i>
                  <small>
                    <strong>Visible par tous les vendeurs</strong><br />
                    Ce challenge s&apos;affiche en gros et en gras en haut de leur espace.
                  </small>
                </div>
              </>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-trophy text-muted" style={{ fontSize: '4rem' }}></i>
                <p className="text-muted mt-3 mb-0">
                  Aucun challenge actif pour le moment
                </p>
                <p className="small text-muted">
                  Créez un challenge pour motiver vos vendeurs !
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
