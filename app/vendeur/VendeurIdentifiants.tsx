'use client';

import { useState, useEffect } from 'react';

export default function VendeurIdentifiants() {
  const [data, setData] = useState<any>(null);
  const [showZoho, setShowZoho] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/credentials')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card mb-4">
        <div className="card-body text-center py-3">
          <div className="spinner-border spinner-border-sm text-primary"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="card mb-4">
      <div className="card-header bg-white">
        <h5 className="mb-0">
          <i className="bi bi-key me-2 text-primary"></i>
          Mes identifiants
        </h5>
      </div>
      <div className="card-body">
        <div className="d-flex flex-column gap-2">
          {/* Email */}
          <div className="d-flex justify-content-between align-items-center p-2 rounded" style={{ background: '#f8f5ff' }}>
            <div>
              <small className="text-muted d-block">Email</small>
              <strong>{data.email}</strong>
            </div>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => navigator.clipboard.writeText(data.email)}
              title="Copier"
            >
              <i className="bi bi-clipboard"></i>
            </button>
          </div>

          {/* Lien RGPD */}
          {data.lienRgpd && (
            <div className="d-flex justify-content-between align-items-center p-2 rounded" style={{ background: '#f0fdf4' }}>
              <div>
                <small className="text-muted d-block">Lien RGPD</small>
                <a href={data.lienRgpd} target="_blank" rel="noopener noreferrer" className="text-break" style={{ fontSize: '0.85rem' }}>
                  {data.lienRgpd.length > 50 ? data.lienRgpd.substring(0, 50) + '...' : data.lienRgpd}
                </a>
              </div>
              <button
                className="btn btn-sm btn-outline-success"
                onClick={() => navigator.clipboard.writeText(data.lienRgpd)}
                title="Copier le lien"
              >
                <i className="bi bi-clipboard"></i>
              </button>
            </div>
          )}

          {/* Mot de passe Zoho */}
          {data.zohoPassword && (
            <div className="d-flex justify-content-between align-items-center p-2 rounded" style={{ background: '#eff6ff' }}>
              <div>
                <small className="text-muted d-block">Mot de passe Zoho Mail</small>
                <span className="font-monospace">
                  {showZoho ? data.zohoPassword : '••••••••••'}
                </span>
              </div>
              <div className="d-flex gap-1">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setShowZoho(!showZoho)}
                  title={showZoho ? 'Masquer' : 'Afficher'}
                >
                  <i className={`bi ${showZoho ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => navigator.clipboard.writeText(data.zohoPassword)}
                  title="Copier"
                >
                  <i className="bi bi-clipboard"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
