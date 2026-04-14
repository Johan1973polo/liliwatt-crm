'use client';

const quickLinks = [
  {
    icon: 'bi-clipboard2-data',
    label: 'Courtier Énergie',
    url: 'https://liliwatt-courtier.onrender.com',
    color: '#7c3aed',
    emoji: '📋',
  },
  {
    icon: 'bi-gem',
    label: 'Prospection',
    url: 'https://liliwatt-prospection.onrender.com',
    color: '#d946ef',
    emoji: '💎',
  },
  {
    icon: 'bi-envelope-at',
    label: 'Zoho Mail',
    url: 'https://mail.zoho.eu',
    color: '#3b82f6',
    emoji: '📧',
  },
  {
    icon: 'bi-camera-video',
    label: 'Google Meet',
    url: 'https://meet.google.com/tzv-pgjc-und',
    color: '#10b981',
    emoji: '📅',
  },
];

export default function QuickAccessCards() {
  return (
    <div className="card mb-4">
      <div className="card-header bg-white">
        <h5 className="mb-0">
          <i className="bi bi-lightning-charge me-2 text-primary"></i>
          Mes accès rapides
        </h5>
      </div>
      <div className="card-body">
        <div className="row g-3">
          {quickLinks.map((link) => (
            <div className="col-6 col-md-3" key={link.label}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card card-vendor text-decoration-none h-100"
                style={{ borderTop: `3px solid ${link.color}` }}
              >
                <div className="card-body text-center py-3">
                  <span style={{ fontSize: '2rem' }}>{link.emoji}</span>
                  <h6 className="mt-2 mb-0" style={{ color: link.color, fontSize: '0.9rem' }}>
                    {link.label}
                  </h6>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
