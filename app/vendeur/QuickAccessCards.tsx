'use client';

import { useState, useEffect } from 'react';

const staticLinks = [
  { label: 'Courtier Énergie', url: 'https://liliwatt-courtier.onrender.com', color: '#7c3aed', emoji: '📋' },
  { label: 'Prospection', url: 'https://liliwatt-prospection.onrender.com', color: '#d946ef', emoji: '💎' },
  { label: 'Zoho Mail', url: 'https://mail.zoho.eu', color: '#2563eb', emoji: '✉️' },
];

interface MeetRoom {
  type: string; title: string; subtitle: string; url: string; icon: string; color: string;
}

export default function QuickAccessCards() {
  const [meetRooms, setMeetRooms] = useState<MeetRoom[]>([]);

  useEffect(() => {
    fetch('/api/me/meet-rooms')
      .then(r => r.json())
      .then(d => setMeetRooms(d.rooms || []))
      .catch(() => {});
  }, []);

  const allCards = [
    ...staticLinks.map(l => ({ ...l, title: l.label })),
    ...meetRooms.map(r => ({
      emoji: r.icon, title: r.title, url: r.url,
      color: r.color === 'gradient' ? 'linear-gradient(135deg, #7c3aed, #d946ef)' : r.color,
    })),
  ];

  const cols = allCards.length >= 5 ? 5 : allCards.length;

  return (
    <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '20px', border: '1px solid #e9d5ff' }}>
      <div style={{ background: '#7c3aed', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }}></span>
        <span style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>⚡ Mes accès rapides</span>
      </div>
      <div style={{ background: 'white', padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '12px' }}>
          {allCards.map((card) => (
            <a
              key={card.title}
              href={card.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: card.color, borderRadius: '12px', padding: '18px 10px',
                textAlign: 'center', textDecoration: 'none', transition: 'filter 0.2s', display: 'block',
              }}
              onMouseEnter={e => { (e.currentTarget).style.filter = 'brightness(0.85)'; }}
              onMouseLeave={e => { (e.currentTarget).style.filter = 'none'; }}
            >
              <span style={{ fontSize: '1.8rem', display: 'block' }}>{card.emoji}</span>
              <span style={{ color: 'white', fontWeight: 600, fontSize: '0.8rem', marginTop: '6px', display: 'block', lineHeight: 1.3 }}>
                {card.title}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
