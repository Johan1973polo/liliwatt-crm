'use client';

import { useState } from 'react';
import AudioDebriefing from './AudioDebriefing';

export default function FormationTabs({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState<'modules' | 'audio'>('modules');

  return (
    <div>
      <div className="d-flex gap-2 mb-4">
        <button
          className="btn py-2 px-4"
          style={{
            background: tab === 'modules' ? 'linear-gradient(135deg, #7c3aed, #d946ef)' : 'white',
            color: tab === 'modules' ? 'white' : '#7c3aed',
            border: tab === 'modules' ? 'none' : '2px solid #7c3aed',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '14px',
          }}
          onClick={() => setTab('modules')}
        >
          <i className="bi bi-book me-2"></i>Modules de formation
        </button>
        <button
          className="btn py-2 px-4"
          style={{
            background: tab === 'audio' ? 'linear-gradient(135deg, #7c3aed, #d946ef)' : 'white',
            color: tab === 'audio' ? 'white' : '#7c3aed',
            border: tab === 'audio' ? 'none' : '2px solid #7c3aed',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '14px',
          }}
          onClick={() => setTab('audio')}
        >
          <i className="bi bi-mic me-2"></i>Débriefing &amp; Bonnes pratiques
        </button>
      </div>

      {tab === 'modules' ? children : <AudioDebriefing />}
    </div>
  );
}
