'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateAdminForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, phone, specialty: specialty || null, avatar: null }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Administrateur cree avec succes !');
        setEmail(''); setPassword(''); setPhone(''); setSpecialty('');
        router.refresh();
      } else {
        setError(data.error || 'Erreur lors de la creation');
      }
    } catch {
      setError('Erreur lors de la creation');
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = { fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '6px', display: 'block' };
  const inputStyle = { width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px' };

  return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '28px', border: '1px solid #e5e7eb' }}>
      <h5 style={{ fontSize: '16px', fontWeight: 700, color: '#1e1b4b', marginBottom: '20px' }}>
        <i className="bi bi-person-plus me-2"></i>Creer un administrateur
      </h5>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>Email *</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="prenom.nom@liliwatt.fr" required disabled={loading} style={inputStyle} />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>Mot de passe *</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Minimum 8 caracteres" required minLength={8} disabled={loading} style={inputStyle} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
          <div>
            <label style={labelStyle}>Telephone</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="+33 6 XX XX XX XX" disabled={loading} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Specialisation</label>
            <input type="text" value={specialty} onChange={e => setSpecialty(e.target.value)}
              placeholder="Ex : Direction commerciale" disabled={loading} style={inputStyle} />
          </div>
        </div>

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '14px',
          background: 'linear-gradient(135deg, #7c3aed, #d946ef)',
          color: 'white', border: 'none', borderRadius: '12px',
          fontWeight: 700, fontSize: '14px', cursor: 'pointer',
          letterSpacing: '0.5px', opacity: loading ? 0.6 : 1,
        }}>
          {loading ? 'Creation en cours...' : 'Creer l\'administrateur'}
        </button>
      </form>
    </div>
  );
}
