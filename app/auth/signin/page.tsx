'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou mot de passe incorrect');
        setLoading(false);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('Une erreur est survenue. Réessayez.');
      setLoading(false);
    }
  }

  return (
    <div className="login-wrapper">
      {/* PANEL GAUCHE - BRANDING */}
      <section className="brand-panel">
        <svg className="bolt-decor" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="boltGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d946ef" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" fill="url(#boltGradient)" />
        </svg>

        <div className="particles">
          {[
            { left: 10, dur: 15, delay: 0 }, { left: 25, dur: 18, delay: 2 },
            { left: 40, dur: 14, delay: 5 }, { left: 55, dur: 20, delay: 1 },
            { left: 70, dur: 16, delay: 4 }, { left: 85, dur: 19, delay: 3 },
            { left: 30, dur: 22, delay: 8 }, { left: 60, dur: 17, delay: 6 },
          ].map((p, i) => (
            <div key={i} className="particle" style={{ left: `${p.left}%`, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }} />
          ))}
        </div>

        <div className="brand-logo fade-up fade-up-1">
          <div className="brand-logo-bolt">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
            </svg>
          </div>
          <div className="brand-logo-text">LILI<span className="watt-accent">WATT</span></div>
        </div>

        <div className="brand-content">
          <div className="brand-eyebrow fade-up fade-up-2">Plateforme courtier énergie</div>
          <h1 className="brand-title fade-up fade-up-2">
            L&apos;énergie de<br />
            <span className="accent">votre réussite.</span>
          </h1>
          <p className="brand-subtitle fade-up fade-up-3">
            Votre espace collaboratif pour piloter vos clients, analyser les factures, suivre vos commissions et accélérer chaque signature.
          </p>
        </div>

        <div className="brand-stats fade-up fade-up-4">
          <div className="stat"><span className="stat-value">50+</span><span className="stat-label">Fournisseurs</span></div>
          <div className="stat"><span className="stat-value">IA</span><span className="stat-label">Extraction facture</span></div>
          <div className="stat"><span className="stat-value">24/7</span><span className="stat-label">Disponibilité</span></div>
        </div>
      </section>

      {/* PANEL DROIT - FORMULAIRE */}
      <section className="form-panel">
        <div className="form-card">
          <div className="form-header fade-up fade-up-2">
            <div className="form-eyebrow">Connexion sécurisée</div>
            <h2 className="form-title">Bon retour parmi nous.</h2>
            <p className="form-subtitle">Connectez-vous à votre espace collaborateur LILIWATT.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field fade-up fade-up-3">
              <label className="field-label" htmlFor="email">Adresse email</label>
              <div className="field-wrapper">
                <input type="email" id="email" className="field-input" placeholder="prenom.nom@liliwatt.fr" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
            </div>

            <div className="field fade-up fade-up-3">
              <label className="field-label" htmlFor="password">Mot de passe</label>
              <div className="field-wrapper">
                <input type="password" id="password" className="field-input" placeholder="••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>

            {error && <div className="error-message fade-up">⚠️ {error}</div>}

            <div className="form-options fade-up fade-up-4">
              <label className="checkbox-wrapper">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                Rester connecté
              </label>
            </div>

            <button type="submit" className="submit-btn fade-up fade-up-4" disabled={loading}>
              {loading ? 'Connexion...' : 'Accéder à mon espace'}
              {!loading && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
                </svg>
              )}
            </button>

            <div className="security-badge fade-up fade-up-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Connexion chiffrée SSL — Vos données sont protégées
            </div>
          </form>
        </div>
      </section>

      <style jsx>{`
        .login-wrapper{min-height:100vh;display:grid;grid-template-columns:1.1fr 1fr;font-family:var(--font-inter),system-ui,sans-serif}
        @media(max-width:980px){.login-wrapper{grid-template-columns:1fr}.brand-panel{min-height:320px}}
        .brand-panel{position:relative;overflow:hidden;background:radial-gradient(ellipse at 20% 0%,rgba(217,70,239,0.35) 0%,transparent 55%),radial-gradient(ellipse at 80% 100%,rgba(124,58,237,0.45) 0%,transparent 55%),linear-gradient(135deg,#1e1b4b 0%,#0f0a2e 100%);display:flex;flex-direction:column;justify-content:space-between;padding:48px 56px;color:white}
        .brand-panel::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px);background-size:56px 56px;pointer-events:none;mask-image:radial-gradient(ellipse at center,black 40%,transparent 100%)}
        .bolt-decor{position:absolute;right:-80px;top:50%;width:520px;height:520px;opacity:0.12;pointer-events:none;animation:float 9s ease-in-out infinite;transform:translateY(-50%)}
        @keyframes float{0%,100%{transform:translateY(-50%) rotate(-4deg)}50%{transform:translateY(-52%) rotate(4deg)}}
        .particles{position:absolute;inset:0;pointer-events:none}
        .particle{position:absolute;width:4px;height:4px;border-radius:50%;background:radial-gradient(circle,#d946ef 0%,transparent 70%);animation:rise linear infinite}
        @keyframes rise{0%{transform:translateY(100vh) scale(0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(-10vh) scale(1.2);opacity:0}}
        .brand-logo{position:relative;z-index:2;display:flex;align-items:center;gap:14px}
        .brand-logo-bolt{width:48px;height:48px;background:linear-gradient(135deg,#7c3aed,#d946ef);border-radius:12px;display:grid;place-items:center;box-shadow:0 8px 28px rgba(217,70,239,0.4);color:white}
        .brand-logo-text{font-family:var(--font-syne),sans-serif;font-weight:800;font-size:26px;letter-spacing:-0.5px;color:white}
        .watt-accent{background:linear-gradient(135deg,#d946ef 0%,#f0abfc 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .brand-content{position:relative;z-index:2;max-width:520px}
        .brand-eyebrow{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;background:rgba(217,70,239,0.15);border:1px solid rgba(217,70,239,0.3);border-radius:100px;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#f0abfc;margin-bottom:22px}
        .brand-eyebrow::before{content:'';width:6px;height:6px;border-radius:50%;background:#d946ef;box-shadow:0 0 12px #d946ef;animation:pulse 2s ease-in-out infinite}
        @keyframes pulse{0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}
        .brand-title{font-family:var(--font-syne),sans-serif;font-weight:700;font-size:clamp(38px,4vw,56px);line-height:1.05;letter-spacing:-1.5px;margin-bottom:18px}
        .accent{background:linear-gradient(135deg,#d946ef 0%,#f0abfc 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-style:italic}
        .brand-subtitle{font-size:17px;line-height:1.65;color:rgba(255,255,255,0.72);max-width:460px}
        .brand-stats{position:relative;z-index:2;display:flex;gap:40px;padding-top:28px;border-top:1px solid rgba(255,255,255,0.1)}
        .stat{display:flex;flex-direction:column;gap:4px}
        .stat-value{font-family:var(--font-syne),sans-serif;font-weight:700;font-size:28px;letter-spacing:-0.5px;background:linear-gradient(135deg,#fff 0%,#d946ef 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .stat-label{font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.5)}
        .form-panel{background:#ffffff;display:flex;align-items:center;justify-content:center;padding:48px 32px;position:relative}
        .form-panel::before{content:'';position:absolute;top:0;left:0;width:120px;height:120px;background:linear-gradient(135deg,rgba(124,58,237,0.1) 0%,transparent 70%);border-radius:0 0 100px 0}
        .form-panel::after{content:'';position:absolute;bottom:0;right:0;width:180px;height:180px;background:linear-gradient(315deg,rgba(217,70,239,0.12) 0%,transparent 70%);border-radius:180px 0 0 0}
        .form-card{position:relative;z-index:1;width:100%;max-width:420px}
        .form-header{margin-bottom:38px}
        .form-eyebrow{font-size:11px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#7c3aed;margin-bottom:14px;display:flex;align-items:center;gap:10px}
        .form-eyebrow::before{content:'';width:24px;height:2px;background:linear-gradient(90deg,#7c3aed,#d946ef)}
        .form-title{font-family:var(--font-syne),sans-serif;font-weight:700;font-size:34px;letter-spacing:-1px;color:#1e1b4b;line-height:1.1;margin-bottom:10px}
        .form-subtitle{color:#6b7280;font-size:15px;line-height:1.6}
        .field{position:relative;margin-bottom:20px}
        .field-label{display:block;font-size:12px;font-weight:700;color:#6b7280;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px}
        .field-wrapper{position:relative}
        .field-icon{position:absolute;left:18px;top:50%;transform:translateY(-50%);width:20px;height:20px;color:#9ca3af;pointer-events:none;transition:color 0.25s ease}
        .field-input{width:100%;padding:15px 18px 15px 52px;border:2px solid #ede9fe;border-radius:14px;font-size:15px;font-family:inherit;background:#faf5ff;color:#1e1b4b;transition:all 0.25s ease;outline:none;box-sizing:border-box}
        .field-input::placeholder{color:#c4b5fd}
        .field-input:focus{border-color:#7c3aed;background:white;box-shadow:0 0 0 4px rgba(124,58,237,0.1)}
        .field-wrapper:focus-within .field-icon{color:#7c3aed}
        .error-message{background:#fef2f2;border:1px solid #fecaca;color:#dc2626;padding:12px 16px;border-radius:10px;font-size:13px;font-weight:500;margin-bottom:16px}
        .form-options{display:flex;justify-content:space-between;align-items:center;margin:24px 0 28px;font-size:13px}
        .checkbox-wrapper{display:flex;align-items:center;gap:8px;cursor:pointer;color:#4b5563;user-select:none}
        .checkbox-wrapper input{width:18px;height:18px;accent-color:#7c3aed;cursor:pointer}
        .submit-btn{width:100%;padding:16px 24px;background:linear-gradient(135deg,#7c3aed 0%,#d946ef 100%);background-size:200% 200%;background-position:0% 50%;color:white;border:none;border-radius:14px;font-size:15px;font-weight:700;font-family:inherit;letter-spacing:0.5px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:all 0.35s ease;box-shadow:0 8px 24px rgba(124,58,237,0.35);position:relative;overflow:hidden}
        .submit-btn::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);transition:left 0.6s ease}
        .submit-btn:hover:not(:disabled){background-position:100% 50%;transform:translateY(-2px);box-shadow:0 12px 32px rgba(217,70,239,0.45)}
        .submit-btn:hover:not(:disabled)::before{left:100%}
        .submit-btn:disabled{opacity:0.7;cursor:not-allowed}
        .security-badge{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:24px;font-size:12px;color:#9ca3af}
        .security-badge svg{color:#7c3aed}
        @media(max-width:980px){.brand-panel{padding:32px 28px;text-align:center;min-height:auto}.brand-logo{justify-content:center}.brand-stats{justify-content:center}.brand-title{font-size:32px}.brand-subtitle{font-size:15px;margin:0 auto}.form-panel{padding:32px 24px}.form-title{font-size:28px}.bolt-decor{width:300px;height:300px;right:-100px;opacity:0.08}}
        .fade-up{opacity:0;transform:translateY(20px);animation:fadeUp 0.7s ease-out forwards}
        .fade-up-1{animation-delay:0.1s}.fade-up-2{animation-delay:0.25s}.fade-up-3{animation-delay:0.4s}.fade-up-4{animation-delay:0.55s}
        @keyframes fadeUp{to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}
