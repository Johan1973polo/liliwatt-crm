'use client';

import { useState, useEffect } from 'react';

interface MarketData {
  value: number;
  change: number;
  changePercent: number;
  history: number[];
  delayed?: boolean;
}

const DEFAULTS: Record<string, MarketData> = {
  electricite: { value: 58.2, change: -1.3, changePercent: -2.2, history: [62, 60, 58, 61, 59, 57, 58], delayed: true },
  brent: { value: 72.4, change: -0.8, changePercent: -1.1, history: [74, 73, 72, 73, 71, 72, 72], delayed: true },
  carbone: { value: 68.5, change: 0.7, changePercent: 1.0, history: [65, 66, 67, 67, 68, 69, 68], delayed: true },
};

function Sparkline({ data, color, width = 90, height = 36 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MarketCard({
  emoji, title, badge, unit, data,
}: {
  emoji: string; title: string; badge: string; unit: string; data: MarketData;
}) {
  const isUp = data.change >= 0;
  const changeColor = isUp ? '#22c55e' : '#ef4444';
  const arrow = isUp ? '▲' : '▼';

  return (
    <div style={{
      background: '#0f0c29',
      border: '1px solid rgba(124,58,237,0.3)',
      borderRadius: '12px',
      padding: '18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600 }}>
          {emoji} {title}
        </span>
        <span style={{
          background: 'rgba(124,58,237,0.2)',
          color: '#a78bfa',
          fontSize: '9px',
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: '4px',
          letterSpacing: '0.5px',
        }}>
          {badge}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: 'white', fontSize: '28px', fontWeight: 800, lineHeight: 1 }}>
            {data.value.toFixed(1)}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '2px' }}>
            {unit}
          </div>
        </div>
        <Sparkline data={data.history} color={changeColor} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: changeColor, fontSize: '13px', fontWeight: 700 }}>
          {arrow} {isUp ? '+' : ''}{data.change.toFixed(2)} ({isUp ? '+' : ''}{data.changePercent.toFixed(1)}%)
        </span>
        {data.delayed && (
          <span style={{ color: '#f97316', fontSize: '9px', fontWeight: 600 }}>
            ⚠ Différé
          </span>
        )}
      </div>
    </div>
  );
}

export default function MarchesEnergie() {
  const [elec, setElec] = useState<MarketData>(DEFAULTS.electricite);
  const [brent, setBrent] = useState<MarketData>(DEFAULTS.brent);
  const [carbone, setCarbone] = useState<MarketData>(DEFAULTS.carbone);

  const fetchAll = async () => {
    const [e, b, c] = await Promise.allSettled([
      fetch('/api/marches/electricite').then(r => r.json()),
      fetch('/api/marches/brent').then(r => r.json()),
      fetch('/api/marches/carbone').then(r => r.json()),
    ]);
    if (e.status === 'fulfilled' && e.value.value) setElec(e.value);
    if (b.status === 'fulfilled' && b.value.value) setBrent(b.value);
    if (c.status === 'fulfilled' && c.value.value) setCarbone(c.value);
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: '#1e1b4b',
      borderRadius: '16px',
      padding: '20px 24px',
      marginBottom: '20px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h5 style={{ color: 'white', fontWeight: 700, fontSize: '15px', margin: 0 }}>
          📊 Marchés Énergie
        </h5>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>
          Actualisation 60s
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <MarketCard emoji="⚡" title="Élec Spot FR" badge="EPEX SPOT" unit="€/MWh" data={elec} />
        <MarketCard emoji="🛢" title="Pétrole Brent" badge="BRENT CRUDE" unit="$/baril" data={brent} />
        <MarketCard emoji="🌱" title="Carbone EU" badge="EU ETS" unit="€/tonne CO₂" data={carbone} />
      </div>
    </div>
  );
}
