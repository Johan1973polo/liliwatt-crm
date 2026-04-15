'use client';

const quickLinks = [
  { label: 'Courtier Énergie', url: 'https://liliwatt-courtier.onrender.com', color: '#7c3aed', emoji: '📋' },
  { label: 'Prospection', url: 'https://liliwatt-prospection.onrender.com', color: '#d946ef', emoji: '💎' },
  { label: 'Zoho Mail', url: 'https://mail.zoho.eu', color: '#2563eb', emoji: '📧' },
  { label: 'Google Meet', url: 'https://meet.google.com/tzv-pgjc-und', color: '#16a34a', emoji: '📅' },
];

export default function QuickAccessCards() {
  return (
    <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '20px', border: '1px solid #e9d5ff' }}>
      <div style={{ background: '#7c3aed', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }}></span>
        <span style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>⚡ Mes accès rapides</span>
      </div>
      <div style={{ background: 'white', padding: '16px 20px' }}>
        <div className="row g-3">
          {quickLinks.map((link) => (
            <div className="col-6 col-md-3" key={link.label}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="d-block text-decoration-none h-100"
                style={{ background: link.color, borderRadius: '12px', padding: '20px 12px', textAlign: 'center', transition: 'filter 0.2s' }}
                onMouseEnter={e => { (e.currentTarget).style.filter = 'brightness(0.85)'; }}
                onMouseLeave={e => { (e.currentTarget).style.filter = 'none'; }}
              >
                <span style={{ fontSize: '2rem', display: 'block' }}>{link.emoji}</span>
                <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', marginTop: '8px', display: 'block' }}>{link.label}</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
