'use client';

import { useState, useEffect } from 'react';

const services = [
  { key: 'zoho', label: 'Zoho Mail', icon: '📧', color: '#3b82f6', url: 'https://mail.zoho.eu' },
  { key: 'courtier', label: 'Courtier Énergie', icon: '📋', color: '#7c3aed', url: 'https://liliwatt-courtier.onrender.com' },
  { key: 'prospection', label: 'Prospection', icon: '💎', color: '#d946ef', url: 'https://liliwatt-prospection.onrender.com' },
];

export default function VendeurIdentifiants() {
  const [data, setData] = useState<any>(null);
  const [showPwd, setShowPwd] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    fetch('/api/user/credentials')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1500);
  };

  const toggle = (key: string) => setShowPwd((p) => ({ ...p, [key]: !p[key] }));

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

  const pwd = data.zohoPassword || '';

  return (
    <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '20px', border: '1px solid #e0e7ff' }}>
      <div style={{ background: '#1e40af', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }}></span>
        <span style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>🔑 Mes identifiants et accès</span>
      </div>
      <div className="card-body p-0">
        <table className="table table-hover mb-0" style={{ fontSize: '13px' }}>
          <thead className="table-light">
            <tr>
              <th style={{ width: '35%' }}>Service</th>
              <th style={{ width: '35%' }}>Identifiant</th>
              <th>Mot de passe</th>
            </tr>
          </thead>
          <tbody>
            {services.map((svc) => (
              <tr key={svc.key}>
                <td>
                  <a
                    href={svc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none fw-semibold"
                    style={{ color: svc.color }}
                  >
                    {svc.icon} {svc.label}
                    <i className="bi bi-box-arrow-up-right ms-1" style={{ fontSize: '10px' }}></i>
                  </a>
                </td>
                <td>
                  <span className="font-monospace">{data.email}</span>
                  <button
                    className="btn btn-sm p-0 ms-2"
                    onClick={() => copy(data.email, svc.key + '-email')}
                    title="Copier"
                    style={{ lineHeight: 1 }}
                  >
                    {copied === svc.key + '-email' ? (
                      <i className="bi bi-check-lg text-success"></i>
                    ) : (
                      <i className="bi bi-clipboard text-muted" style={{ fontSize: '12px' }}></i>
                    )}
                  </button>
                </td>
                <td>
                  {pwd ? (
                    <div className="d-flex align-items-center gap-1">
                      <span className="font-monospace">
                        {showPwd[svc.key] ? pwd : '•••••••'}
                      </span>
                      <button
                        className="btn btn-sm p-0"
                        onClick={() => toggle(svc.key)}
                        title={showPwd[svc.key] ? 'Masquer' : 'Afficher'}
                        style={{ lineHeight: 1 }}
                      >
                        <i className={`bi ${showPwd[svc.key] ? 'bi-eye-slash' : 'bi-eye'} text-muted`} style={{ fontSize: '13px' }}></i>
                      </button>
                      <button
                        className="btn btn-sm p-0"
                        onClick={() => copy(pwd, svc.key + '-pwd')}
                        title="Copier"
                        style={{ lineHeight: 1 }}
                      >
                        {copied === svc.key + '-pwd' ? (
                          <i className="bi bi-check-lg text-success"></i>
                        ) : (
                          <i className="bi bi-clipboard text-muted" style={{ fontSize: '12px' }}></i>
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-muted fst-italic">Non configuré</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}
