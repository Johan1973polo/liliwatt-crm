'use client';

import { useEffect, useRef, useState } from 'react';

// --- TradingView Widget (Brent + Gaz) ---
const tvWidgets = [
  { symbol: 'TVC:UKOIL', label: '🛢 Brent Crude' },
  { symbol: 'NYMEX:NG1!', label: '🔥 Gaz Naturel' },
];

function TradingViewWidget({ symbol, label }: { symbol: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = '';
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol, width: '100%', height: 180, locale: 'fr', dateRange: '1M',
      colorTheme: 'dark', trendLineColor: '#7c3aed',
      underLineColor: 'rgba(124,58,237,0.15)', isTransparent: true, autosize: true, largeChartUrl: '',
    });
    const wrapper = document.createElement('div');
    wrapper.className = 'tradingview-widget-container';
    wrapper.appendChild(script);
    ref.current.appendChild(wrapper);
  }, [symbol]);

  return (
    <div style={{ background: '#0f0c29', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px 4px', color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: 600 }}>{label}</div>
      <div ref={ref} style={{ height: '180px', overflow: 'hidden' }} />
    </div>
  );
}

// --- Static Card (Élec + Carbone) ---
interface StaticData { value: number; change: number; changePercent: number; }

function StaticCard({ emoji, label, badge, unit, endpoint }: {
  emoji: string; label: string; badge: string; unit: string; endpoint: string;
}) {
  const [data, setData] = useState<StaticData | null>(null);

  useEffect(() => {
    fetch(endpoint).then(r => r.json()).then(setData).catch(() => {});
    const t = setInterval(() => { fetch(endpoint).then(r => r.json()).then(setData).catch(() => {}); }, 300000);
    return () => clearInterval(t);
  }, [endpoint]);

  const d = data || { value: 0, change: 0, changePercent: 0 };
  const isUp = d.change >= 0;
  const color = isUp ? '#22c55e' : '#ef4444';
  const arrow = isUp ? '▲' : '▼';
  const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div style={{
      background: '#0f0c29', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '12px',
      padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '210px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: 600 }}>{emoji} {label}</span>
        <span style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>{badge}</span>
      </div>

      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        {data ? (
          <>
            <div style={{ color: 'white', fontSize: '28px', fontWeight: 800, lineHeight: 1 }}>{d.value.toFixed(2)}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '4px' }}>{unit}</div>
          </>
        ) : (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Chargement...</div>
        )}
      </div>

      <div>
        {data && (
          <div style={{ color, fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
            {arrow} {isUp ? '+' : ''}{d.change.toFixed(2)} ({isUp ? '+' : ''}{d.changePercent.toFixed(1)}%)
          </div>
        )}
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px' }}>
          {today}
        </div>
      </div>
    </div>
  );
}

// --- Main ---
export default function MarchesEnergie() {
  return (
    <div style={{ background: '#1e1b4b', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
      <h5 style={{ color: 'white', fontWeight: 700, fontSize: '14px', margin: '0 0 16px' }}>
        📊 Marchés Énergie
      </h5>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {tvWidgets.map((w) => (
          <TradingViewWidget key={w.symbol} symbol={w.symbol} label={w.label} />
        ))}
        <StaticCard emoji="⚡" label="Spot France" badge="EPEX J-1" unit="€/MWh" endpoint="/api/marches/electricite" />
        <StaticCard emoji="🌱" label="Carbone EU" badge="EU ETS" unit="€/tCO₂" endpoint="/api/marches/carbone" />
      </div>
    </div>
  );
}
