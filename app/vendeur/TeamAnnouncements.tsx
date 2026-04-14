'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function TeamAnnouncements() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [saleAmount, setSaleAmount] = useState('');

  const handleInvoiceAnnouncement = async () => {
    if (loading) return;

    const confirmed = confirm('Annoncer à toute l\'équipe que vous avez récupéré une facture ?');
    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'INVOICE' }),
      });

      if (response.ok) {
        alert('🔔 Félicitations ! Toute l\'équipe a été notifiée de votre facture récupérée !');
        router.refresh();
      } else {
        alert('Erreur lors de l\'annonce');
      }
    } catch (error) {
      alert('Erreur lors de l\'annonce');
    } finally {
      setLoading(false);
    }
  };

  const handleSaleAnnouncement = async () => {
    if (!saleAmount || isNaN(parseFloat(saleAmount)) || parseFloat(saleAmount) <= 0) {
      alert('Veuillez saisir un montant valide');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SALE',
          amount: parseFloat(saleAmount),
        }),
      });

      if (response.ok) {
        alert('🏆 Félicitations ! Toute l\'équipe a été notifiée de votre vente !');
        setShowSaleModal(false);
        setSaleAmount('');
        router.refresh();
      } else {
        alert('Erreur lors de l\'annonce');
      }
    } catch (error) {
      alert('Erreur lors de l\'annonce');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="card mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">
            <i className="bi bi-megaphone me-2"></i>
            Annonces à l&apos;équipe
          </h5>
        </div>
        <div className="card-body">
          <p className="text-muted mb-4">
            Partagez vos réussites avec toute l&apos;équipe ! Tout le monde recevra une notification.
          </p>

          <div className="row g-3">
            {/* Bouton Cloche - Facture récupérée */}
            <div className="col-md-4">
              <button
                onClick={handleInvoiceAnnouncement}
                disabled={loading}
                className="btn btn-lg w-100 d-flex flex-column align-items-center justify-content-center"
                style={{
                  height: '200px',
                  backgroundColor: '#ffc107',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(255, 193, 7, 0.4)',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 193, 7, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 193, 7, 0.4)';
                }}
              >
                <i className="bi bi-bell-fill" style={{ fontSize: '4rem', color: '#fff' }}></i>
                <span className="mt-3 fw-bold text-white" style={{ fontSize: '1.2rem' }}>
                  J&apos;ai récupéré une facture !
                </span>
              </button>
            </div>

            {/* Image vendeur au centre */}
            <div className="col-md-4 d-flex align-items-center justify-content-center">
              <Image
                src="/image-vendeur.png"
                alt="Image Vendeur"
                width={300}
                height={200}
                style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
              />
            </div>

            {/* Bouton Lingot - Vente réalisée */}
            <div className="col-md-4">
              <button
                onClick={() => setShowSaleModal(true)}
                disabled={loading}
                className="btn btn-lg w-100 d-flex flex-column align-items-center justify-content-center"
                style={{
                  height: '200px',
                  background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.4)';
                }}
              >
                <i className="bi bi-gem" style={{ fontSize: '4rem', color: '#fff' }}></i>
                <span className="mt-3 fw-bold text-white" style={{ fontSize: '1.2rem' }}>
                  Déclarer ma vente !
                </span>
              </button>
            </div>
          </div>

          <div className="alert alert-info mt-4 mb-0">
            <i className="bi bi-info-circle me-2"></i>
            <small>
              Ces annonces motivent toute l&apos;équipe en partageant vos succès instantanément !
            </small>
          </div>
        </div>
      </div>

      {/* Modal pour saisir le montant de la vente */}
      {showSaleModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => !loading && setShowSaleModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-gem me-2 text-warning"></i>
                  Déclarer votre vente
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => !loading && setShowSaleModal(false)}
                  disabled={loading}
                ></button>
              </div>
              <div className="modal-body">
                <label htmlFor="saleAmount" className="form-label fw-semibold">
                  Montant de la vente (€)
                </label>
                <input
                  type="number"
                  id="saleAmount"
                  className="form-control form-control-lg"
                  placeholder="Ex: 2500"
                  value={saleAmount}
                  onChange={(e) => setSaleAmount(e.target.value)}
                  disabled={loading}
                  step="0.01"
                  min="0"
                />
                <small className="text-muted">
                  Toute l&apos;équipe sera notifiée de cette vente !
                </small>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSaleModal(false)}
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn btn-warning btn-lg"
                  onClick={handleSaleAnnouncement}
                  disabled={loading}
                >
                  <i className="bi bi-megaphone me-2"></i>
                  {loading ? 'Annonce en cours...' : 'Annoncer à l\'équipe'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
