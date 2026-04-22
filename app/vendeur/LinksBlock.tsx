'use client';

import useSWR from 'swr';
import { useState } from 'react';

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  subtitle: string | null;
  scope: string;
  isCopy?: boolean;
}

const fetcher = (url: string) => fetch(url).then(r => r.json()).catch(() => ({ links: [], rgpdLink: null }));

export default function LinksBlock() {
  const { data } = useSWR('/api/links/visible', fetcher, { refreshInterval: 60000 });
  const [copied, setCopied] = useState<string | null>(null);

  const links: LinkItem[] = data?.links || [];
  const rgpdLink: string | null = data?.rgpdLink || null;

  const allCards: LinkItem[] = [
    ...links,
    ...(rgpdLink ? [{
      id: 'rgpd',
      icon: '🔒',
      title: 'Mon lien RGPD',
      subtitle: 'Cliquer pour copier',
      url: rgpdLink,
      scope: 'RGPD',
      isCopy: true,
    }] : []),
  ];

  if (allCards.length === 0) return null;

  async function handleClick(e: React.MouseEvent, card: LinkItem) {
    if (card.isCopy) {
      e.preventDefault();
      await navigator.clipboard.writeText(card.url);
      setCopied(card.id);
      setTimeout(() => setCopied(null), 2000);
    }
  }

  return (
    <div className="card mb-4">
      <div className="card-header bg-white">
        <h5 className="mb-0" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="bi bi-link-45deg"></i> Mes liens utiles
        </h5>
      </div>
      <div className="card-body">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '14px',
        }}>
          {allCards.map(card => (
            <a
              key={card.id}
              href={card.isCopy ? '#' : card.url}
              target={card.isCopy ? undefined : '_blank'}
              rel="noopener noreferrer"
              onClick={(e) => handleClick(e, card)}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '14px',
                padding: '22px 16px',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '10px',
                transition: 'all 0.25s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 28px rgba(124, 58, 237, 0.15)';
                e.currentTarget.style.borderColor = '#7c3aed';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px',
                background: 'linear-gradient(135deg, #f5f3ff, #fae8ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px',
              }}>
                {card.icon || '🔗'}
              </div>
              <div style={{
                fontSize: '14px', fontWeight: 700, color: '#1e1b4b',
                lineHeight: 1.2, letterSpacing: '-0.2px',
              }}>
                {card.title}
              </div>
              {(card.subtitle || card.isCopy) && (
                <div style={{
                  fontSize: '11px', color: '#6b7280',
                  fontWeight: 500, lineHeight: 1.4,
                }}>
                  {copied === card.id ? '✅ Copie !' : (card.subtitle || '')}
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
