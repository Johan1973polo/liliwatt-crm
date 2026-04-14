'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Referent {
  id: string;
  email: string;
  phone: string | null;
}

export default function MessageBlock({ referent }: { referent: Referent | null }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim() || !referent) {
      alert('Veuillez écrire un message');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUserId: referent.id,
          body: message,
        }),
      });

      if (response.ok) {
        setMessage('');
        alert('Message envoyé avec succès');
        router.refresh();
      } else {
        alert('Erreur lors de l&apos;envoi du message');
      }
    } catch (error) {
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setLoading(false);
    }
  };

  if (!referent) {
    return (
      <div className="card mb-4 bg-primary bg-opacity-10">
        <div className="card-header bg-white">
          <h5 className="mb-0">
            <i className="bi bi-chat-dots me-2"></i>
            Messagerie
          </h5>
        </div>
        <div className="card-body">
          <p className="text-muted mb-0">Vous n&apos;avez pas de référent assigné.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-4 bg-primary bg-opacity-10">
      <div className="card-header bg-white">
        <h5 className="mb-0">
          <i className="bi bi-chat-dots me-2"></i>
          Messagerie
        </h5>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <p className="text-muted small mb-1">
            <i className="bi bi-person-circle me-1"></i>
            Votre référent : <strong>{referent.email}</strong>
          </p>
          {referent.phone && (
            <p className="text-muted small mb-0">
              <i className="bi bi-telephone me-1"></i>
              Téléphone : <a href={`tel:${referent.phone}`} className="text-decoration-none">
                <strong>{referent.phone}</strong>
              </a>
            </p>
          )}
        </div>

        <div className="mb-3">
          <textarea
            className="form-control"
            rows={4}
            placeholder="Écrivez votre message ici..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
          ></textarea>
        </div>

        <button
          onClick={handleSendMessage}
          className="btn btn-primary w-100"
          disabled={loading || !message.trim()}
        >
          <i className="bi bi-send me-2"></i>
          {loading ? 'Envoi...' : 'Envoyer'}
        </button>
      </div>
    </div>
  );
}
