'use client';

import { useState, useEffect } from 'react';

export default function VendeurIdentifiants() {
  const [data, setData] = useState<any>(null);
  const [showZoho, setShowZoho] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    fetch('/api/user/credentials')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1500);
  };

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
          <i className="bi bi-key-fill me-2 text-primary"></i>
          Mes identifiants et accès
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
              onClick={() => copyToClipboard(data.email, 'email')}
              title="Copier"
            >
              {copied === 'email' ? <i className="bi bi-check-lg text-success"></i> : <i className="bi bi-clipboard"></i>}
            </button>
          </div>

          {/* Mot de passe Zoho */}
          <div className="d-flex justify-content-between align-items-center p-2 rounded" style={{ background: '#eff6ff' }}>
            <div>
              <small className="text-muted d-block">Mot de passe Zoho Mail</small>
              <span className="font-monospace">
                {data.zohoPassword ? (showZoho ? data.zohoPassword : '••••••••••') : <span className="text-muted fst-italic">Non configuré</span>}
              </span>
            </div>
            {data.zohoPassword && (
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
                  onClick={() => copyToClipboard(data.zohoPassword, 'zoho')}
                  title="Copier"
                >
                  {copied === 'zoho' ? <i className="bi bi-check-lg text-success"></i> : <i className="bi bi-clipboard"></i>}
                </button>
              </div>
            )}
          </div>

          {/* Lien RGPD */}
          <div className="d-flex justify-content-between align-items-center p-2 rounded" style={{ background: '#f0fdf4' }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <small className="text-muted d-block">Lien RGPD</small>
              {data.lienRgpd ? (
                <a href={data.lienRgpd} target="_blank" rel="noopener noreferrer" className="text-break" style={{ fontSize: '0.85rem' }}>
                  {data.lienRgpd.length > 45 ? data.lienRgpd.substring(0, 45) + '...' : data.lienRgpd}
                </a>
              ) : (
                <span className="text-muted fst-italic">Non configuré</span>
              )}
            </div>
            {data.lienRgpd && (
              <button
                className="btn btn-sm btn-outline-success ms-2"
                onClick={() => copyToClipboard(data.lienRgpd, 'rgpd')}
                title="Copier le lien"
              >
                {copied === 'rgpd' ? <i className="bi bi-check-lg text-success"></i> : <i className="bi bi-clipboard"></i>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
