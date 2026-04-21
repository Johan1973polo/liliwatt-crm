'use client';

import { useEffect, useRef, useState } from 'react';

// --- Types ---
interface StaticData { value: number; change: number; changePercent: number; history?: number[]; }

// --- Sparkline SVG ---
function Sparkline({ data, color, w = 120, h = 50 }: { data: number[]; color: string; w?: number; h?: number }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - 5 - ((v - min) / range) * (h - 10);
    return `${x},${y}`;
  });
  const lastPt = pts[pts.length - 1].split(',');
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block', marginTop: '6px' }}>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx={lastPt[0]} cy={lastPt[1]} r="3" fill={color} />
    </svg>
  );
}

// --- TradingView Widget ---
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

// --- Static Card ---
function StaticCard({ emoji, label, badge, unit, endpoint }: {
  emoji: string; label: string; badge: string; unit: string; endpoint: string;
}) {
  const [data, setData] = useState<StaticData | null>(null);
  useEffect(() => {
    const load = () => fetch(endpoint).then(r => r.json()).then(setData).catch(() => {});
    load();
    const t = setInterval(load, 300000);
    return () => clearInterval(t);
  }, [endpoint]);

  const d = data || { value: 0, change: 0, changePercent: 0 };
  const isUp = d.change >= 0;
  const color = isUp ? '#22c55e' : '#ef4444';

  return (
    <div style={{
      background: '#0f0c29', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '12px',
      padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '210px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: 600 }}>{emoji} {label}</span>
        <span style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>{badge}</span>
      </div>
      <div style={{ textAlign: 'center', padding: '8px 0 0' }}>
        {data ? (
          <>
            <div style={{ color: 'white', fontSize: '28px', fontWeight: 800, lineHeight: 1 }}>{d.value.toFixed(2)}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '4px' }}>{unit}</div>
          </>
        ) : (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Chargement...</div>
        )}
      </div>
      {data?.history && <Sparkline data={data.history} color={color} />}
      <div>
        {data && (
          <div style={{ color, fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>
            {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{d.change.toFixed(2)} ({isUp ? '+' : ''}{d.changePercent.toFixed(1)}%)
          </div>
        )}
      </div>
    </div>
  );
}

// --- Info Panel ---
function InfoPanel() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: '12px' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'block', width: '100%', background: '#1e1b4b',
          border: '1px solid rgba(124,58,237,0.3)', borderRadius: '8px',
          padding: '10px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '12px',
          cursor: 'pointer', textAlign: 'center', transition: 'background 0.2s',
        }}
        onMouseEnter={e => { (e.target as HTMLElement).style.background = '#2e2860'; }}
        onMouseLeave={e => { (e.target as HTMLElement).style.background = '#1e1b4b'; }}
      >
        ℹ️ Pourquoi ces chiffres comptent pour vos appels ?
        <span style={{ display: 'inline-block', marginLeft: '6px', transition: 'transform 0.3s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
      </button>

      <div style={{
        maxHeight: open ? '800px' : '0', overflow: 'hidden',
        transition: 'max-height 0.4s ease-in-out', marginTop: open ? '12px' : '0',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ color: 'white', fontSize: '15px', fontWeight: 700 }}>Vous êtes des opérateurs de marché</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '4px' }}>
            Chez LILIWATT, on ne vend pas — on conseille. Ces cours sont vos arguments du jour.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <InfoCard
            title="Brent monte"
            badge="APPELER" badgeColor="#22c55e"
            text="Le coût de production d'énergie augmente. Dans 2 à 3 mois les fournisseurs vont répercuter ces hausses sur les contrats C3/C4."
            action='→ Accroche : "Les cours sont au plus haut, c&apos;est maintenant qu&apos;on sécurise votre contrat"'
          />
          <InfoCard
            title="TTF Europe monte"
            badge="APPELER" badgeColor="#22c55e"
            text="Le gaz naturel flambe en Europe. Les industriels C3/C4 sous contrat de marché vont subir de plein fouet."
            action='→ Accroche : "Le TTF a progressé ce mois, votre prochain renouvellement est à risque"'
          />
          <InfoCard
            title="Spot bas aujourd'hui"
            badge="NÉGOCIER" badgeColor="#22c55e"
            text="Le prix spot bas donne de la marge aux fournisseurs. Meilleur moment pour soumettre vos dossiers C3/C4."
            action="→ Timing : soumettez vos MECs en priorité aujourd'hui"
          />
          <InfoCard
            title="Carbone ETS monte"
            badge="APPELER C3/C4" badgeColor="#22c55e"
            text="Les industries C3/C4 à forte consommation cherchent à optimiser chaque poste de dépense énergétique."
            action='→ Argument : "La taxe carbone monte, votre facture énergie va suivre"'
          />
        </div>

        <div style={{
          background: '#1e1b4b', borderRadius: '10px', padding: '16px 20px', marginTop: '14px', textAlign: 'center',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontStyle: 'italic', lineHeight: 1.7, margin: 0 }}>
            Un opérateur de marché LILIWATT ne dit pas &laquo;&nbsp;je vends de l&apos;énergie&nbsp;&raquo;.<br />
            Il dit &laquo;&nbsp;je surveille les marchés pour vous <span style={{ color: '#d946ef', fontWeight: 600 }}>protéger des hausses à venir</span>&nbsp;&raquo;.<br />
            C&apos;est cette posture qui transforme un appel en rendez-vous.
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, badge, badgeColor, text, action }: {
  title: string; badge: string; badgeColor: string; text: string; action: string;
}) {
  return (
    <div style={{
      background: '#0f0c29', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '10px', padding: '14px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ color: 'white', fontSize: '13px', fontWeight: 700 }}>{title}</span>
        <span style={{ background: badgeColor, color: 'white', fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px' }}>{badge}</span>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', lineHeight: 1.6, margin: '0 0 8px' }}>{text}</p>
      <p style={{ color: '#a78bfa', fontSize: '11px', fontWeight: 600, margin: 0 }}>{action}</p>
    </div>
  );
}

// --- Main ---
export default function MarchesEnergie() {
  return (
    <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '20px', border: '1px solid #e9d5ff' }}>
      <div style={{ background: '#1e1b4b', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }}></span>
        <span style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>📊 Marchés Énergie</span>
      </div>
      <div style={{ background: 'white', padding: '16px 20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <TradingViewWidget symbol="TVC:UKOIL" label="🛢 Brent Crude" />
        <StaticCard emoji="🔥" label="Gaz TTF" badge="TTF Europe" unit="€/MWh" endpoint="/api/marches/gaz" />
        <StaticCard emoji="⚡" label="Spot France" badge="EPEX J-1" unit="€/MWh" endpoint="/api/marches/electricite" />
        <StaticCard emoji="🌱" label="Carbone EU" badge="EU ETS" unit="€/tCO₂" endpoint="/api/marches/carbone" />
      </div>
      <InfoPanel />
      </div>
    </div>
  );
}
