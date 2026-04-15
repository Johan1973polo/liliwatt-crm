'use client';

import Link from 'next/link';

interface ModuleCardProps {
  module: {
    id: string;
    title: string;
    description: string;
    order: number;
    icon: string;
    durationEstimated: number;
    status: string;
    unlockedBy: string | null;
    unlockedAt: Date | null | undefined;
    startedAt: Date | null | undefined;
    completedAt: Date | null | undefined;
    score: number | null | undefined;
  };
}

const STYLES = {
  COMPLETED: {
    headerBg: '#166534',
    numColor: '#bbf7d0',
    badgeBg: '#bbf7d0', badgeColor: '#166534',
    unlockBg: '#f0fdf4', unlockColor: '#166534',
    bodyOpacity: 1,
  },
  UNLOCKED: {
    headerBg: '#4c1d95',
    numColor: '#ddd6fe',
    badgeBg: '#ddd6fe', badgeColor: '#4c1d95',
    unlockBg: '#f5f3ff', unlockColor: '#6d28d9',
    bodyOpacity: 1,
  },
  IN_PROGRESS: {
    headerBg: '#4c1d95',
    numColor: '#ddd6fe',
    badgeBg: '#fbbf24', badgeColor: '#78350f',
    unlockBg: '#f5f3ff', unlockColor: '#6d28d9',
    bodyOpacity: 1,
  },
  LOCKED: {
    headerBg: '#374151',
    numColor: '#d1d5db',
    badgeBg: '#d1d5db', badgeColor: '#374151',
    unlockBg: '#f9fafb', unlockColor: '#6b7280',
    bodyOpacity: 0.6,
  },
};

export default function ModuleCard({ module }: ModuleCardProps) {
  const s = STYLES[module.status as keyof typeof STYLES] || STYLES.LOCKED;
  const isLocked = module.status === 'LOCKED';
  const isCompleted = module.status === 'COMPLETED';
  const isInProgress = module.status === 'IN_PROGRESS';

  const badgeLabel = isCompleted ? 'Complété' : isInProgress ? 'En cours' : module.status === 'UNLOCKED' ? 'Déverrouillé' : 'Verrouillé';
  const badgeIcon = isCompleted ? 'bi-check-circle-fill' : isInProgress ? 'bi-hourglass-split' : module.status === 'UNLOCKED' ? 'bi-unlock-fill' : 'bi-lock-fill';

  return (
    <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid #e5e7eb', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header coloré */}
      <div style={{ background: s.headerBg, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className={`bi ${module.icon}`} style={{ color: 'white', fontSize: '18px' }}></i>
          <span style={{ color: s.numColor, fontSize: '12px', fontWeight: 700, background: 'rgba(255,255,255,0.1)', padding: '2px 10px', borderRadius: '10px' }}>
            Module {module.order}
          </span>
        </div>
        <span style={{ background: s.badgeBg, color: s.badgeColor, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <i className={`bi ${badgeIcon}`} style={{ fontSize: '10px' }}></i>
          {badgeLabel}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', opacity: s.bodyOpacity, background: 'white' }}>
        <h6 style={{ color: '#1e1b4b', fontWeight: 700, fontSize: '14px', margin: '0 0 6px' }}>{module.title}</h6>
        <p style={{ color: '#6b7280', fontSize: '12px', lineHeight: 1.5, margin: '0 0 12px', flex: 1 }}>{module.description}</p>

        <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '10px' }}>
          <i className="bi bi-clock me-1"></i>{module.durationEstimated} min
        </div>

        {/* Déverrouillé par */}
        {module.unlockedBy && (
          <div style={{ background: s.unlockBg, borderRadius: '8px', padding: '8px 12px', marginBottom: '10px', fontSize: '11px', color: s.unlockColor }}>
            <i className="bi bi-unlock me-1"></i>
            Déverrouillé par <strong>{module.unlockedBy}</strong>
            {module.unlockedAt && (
              <span style={{ display: 'block', opacity: 0.7, marginTop: '2px' }}>
                le {new Date(module.unlockedAt).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>
        )}

        {/* Score + date complété */}
        {isCompleted && (
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            {module.score != null && (
              <div style={{ color: '#16a34a', fontSize: '13px', fontWeight: 700 }}>
                <i className="bi bi-star-fill me-1"></i>Score : {module.score}/100
              </div>
            )}
            {module.completedAt && (
              <div style={{ color: '#16a34a', fontSize: '11px', marginTop: '2px' }}>
                <i className="bi bi-check-circle-fill me-1"></i>
                Complété le {new Date(module.completedAt).toLocaleDateString('fr-FR')}
              </div>
            )}
          </div>
        )}

        {/* Bouton action */}
        {isLocked ? (
          <button disabled style={{ background: '#e5e7eb', color: '#9ca3af', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: 600, cursor: 'not-allowed', width: '100%' }}>
            <i className="bi bi-lock-fill me-2"></i>Module verrouillé
          </button>
        ) : isCompleted ? (
          <Link href={`/formation/${module.id}`} style={{
            display: 'block', textAlign: 'center', textDecoration: 'none',
            background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
            borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: 600,
          }}>
            <i className="bi bi-eye me-2"></i>Revoir le contenu
          </Link>
        ) : isInProgress ? (
          <Link href={`/formation/${module.id}`} style={{
            display: 'block', textAlign: 'center', textDecoration: 'none',
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: 'white', border: 'none',
            borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: 600,
          }}>
            <i className="bi bi-arrow-right-circle me-2"></i>Reprendre
          </Link>
        ) : (
          <Link href={`/formation/${module.id}`} style={{
            display: 'block', textAlign: 'center', textDecoration: 'none',
            background: '#7c3aed', color: 'white', border: 'none',
            borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: 600,
          }}>
            <i className="bi bi-play-circle me-2"></i>Commencer
          </Link>
        )}
      </div>
    </div>
  );
}
