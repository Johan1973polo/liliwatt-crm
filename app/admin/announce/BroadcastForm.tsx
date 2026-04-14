'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BroadcastForm() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('ALL');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      alert('Veuillez écrire un message');
      return;
    }

    const confirmed = confirm(
      `Êtes-vous sûr d'envoyer ce message à ${
        target === 'ALL' ? 'toute l\'équipe' :
        target === 'REFERENTS' ? 'tous les référents' :
        'tous les vendeurs'
      } ?`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, target }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Message envoyé avec succès à ${data.count} personne(s) !`);
        setMessage('');
        router.refresh();
      } else {
        alert('Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {/* Sélection de la cible */}
          <div className="mb-4">
            <label className="form-label fw-semibold">
              <i className="bi bi-people me-2"></i>
              Destinataires
            </label>
            <div className="btn-group w-100" role="group">
              <input
                type="radio"
                className="btn-check"
                name="target"
                id="target-all"
                value="ALL"
                checked={target === 'ALL'}
                onChange={(e) => setTarget(e.target.value)}
              />
              <label className="btn btn-outline-primary" htmlFor="target-all">
                <i className="bi bi-globe me-1"></i>
                Toute l&apos;équipe
              </label>

              <input
                type="radio"
                className="btn-check"
                name="target"
                id="target-referents"
                value="REFERENTS"
                checked={target === 'REFERENTS'}
                onChange={(e) => setTarget(e.target.value)}
              />
              <label className="btn btn-outline-primary" htmlFor="target-referents">
                <i className="bi bi-person-badge me-1"></i>
                Référents uniquement
              </label>

              <input
                type="radio"
                className="btn-check"
                name="target"
                id="target-vendeurs"
                value="VENDEURS"
                checked={target === 'VENDEURS'}
                onChange={(e) => setTarget(e.target.value)}
              />
              <label className="btn btn-outline-primary" htmlFor="target-vendeurs">
                <i className="bi bi-person me-1"></i>
                Vendeurs uniquement
              </label>
            </div>
          </div>

          {/* Message */}
          <div className="mb-4">
            <label htmlFor="message" className="form-label fw-semibold">
              <i className="bi bi-chat-text me-2"></i>
              Message
            </label>
            <textarea
              id="message"
              className="form-control"
              rows={6}
              placeholder="Écrivez votre message ici..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              required
            ></textarea>
            <small className="text-muted">
              Tout le monde recevra une notification de cette annonce.
            </small>
          </div>

          {/* Bouton d'envoi */}
          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading || !message.trim()}
            >
              <i className="bi bi-megaphone me-2"></i>
              {loading ? 'Envoi en cours...' : 'Envoyer l\'annonce'}
            </button>
          </div>
        </form>

        <div className="alert alert-info mt-4 mb-0">
          <i className="bi bi-info-circle me-2"></i>
          <strong>Note :</strong> Les notifications admin sont affichées avec une couleur différente pour se démarquer.
        </div>
      </div>
    </div>
  );
}
