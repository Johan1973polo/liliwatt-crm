'use client';

import { useEffect, useRef } from 'react';

const widgets = [
  { symbol: 'EPEXSPOT:FR_BASE', label: '⚡ Spot France', id: 'tv_elec' },
  { symbol: 'TVC:NATGASEUR', label: '🔥 Gaz TTF', id: 'tv_gaz' },
  { symbol: 'TVC:UKOIL', label: '🛢 Brent Crude', id: 'tv_brent' },
  { symbol: 'ICEEUR:EUA1!', label: '🌱 Carbone ETS', id: 'tv_carbone' },
];

function TradingViewWidget({ symbol, label, id }: { symbol: string; label: string; id: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // Nettoyer le contenu précédent
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      width: '100%',
      height: 180,
      locale: 'fr',
      dateRange: '1M',
      colorTheme: 'dark',
      trendLineColor: '#7c3aed',
      underLineColor: 'rgba(124,58,237,0.15)',
      isTransparent: true,
      autosize: true,
      largeChartUrl: '',
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'tradingview-widget-container';
    wrapper.appendChild(script);
    containerRef.current.appendChild(wrapper);
  }, [symbol]);

  return (
    <div style={{
      background: '#0f0c29',
      border: '1px solid rgba(124,58,237,0.3)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '10px 14px 4px',
        color: 'rgba(255,255,255,0.8)',
        fontSize: '12px',
        fontWeight: 600,
      }}>
        {label}
      </div>
      <div ref={containerRef} style={{ height: '180px', overflow: 'hidden' }} />
    </div>
  );
}

export default function MarchesEnergie() {
  return (
    <div style={{
      background: '#1e1b4b',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '20px',
    }}>
      <h5 style={{ color: 'white', fontWeight: 700, fontSize: '14px', margin: '0 0 16px' }}>
        📊 Marchés Énergie
      </h5>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {widgets.map((w) => (
          <TradingViewWidget key={w.id} symbol={w.symbol} label={w.label} id={w.id} />
        ))}
      </div>
    </div>
  );
}
