'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const availableAvatars = [
  '/avatars/Akim.png',
  '/avatars/Kevin.png',
  '/avatars/Manu.png',
  '/avatars/Sabir.png',
  '/avatars/johan.png',
  '/avatars/olivier.png',
];

export default function CreateAdminForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [avatar, setAvatar] = useState('');
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
        body: JSON.stringify({
          email,
          password,
          phone,
          specialty: specialty || null,
          avatar: avatar || null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Administrateur créé avec succès !');
        setEmail('');
        setPassword('');
        setPhone('');
        setSpecialty('');
        setAvatar('');
        router.refresh();
      } else {
        setError(data.error || 'Erreur lors de la création');
      }
    } catch (err) {
      setError('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <i className="bi bi-person-plus me-2"></i>
          Créer un nouvel administrateur
        </h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">
              <i className="bi bi-envelope me-2"></i>
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="admin@liliwatt.fr"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label fw-semibold">
              <i className="bi bi-lock me-2"></i>
              Mot de passe
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="••••••••"
              minLength={6}
            />
            <small className="text-muted">
              Minimum 6 caractères
            </small>
          </div>

          <div className="mb-3">
            <label htmlFor="phone" className="form-label fw-semibold">
              <i className="bi bi-telephone me-2"></i>
              Téléphone (optionnel)
            </label>
            <input
              type="tel"
              className="form-control"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              placeholder="+33 6 12 34 56 78"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="specialty" className="form-label fw-semibold">
              <i className="bi bi-award me-2"></i>
              Spécialisation (optionnel)
            </label>
            <input
              type="text"
              className="form-control"
              id="specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              disabled={loading}
              placeholder="Ex: PRÉSIDENT, DIRECTION COMMERCIALE, etc."
            />
            <small className="text-muted">
              La spécialisation sera affichée dans la liste des administrateurs et la messagerie
            </small>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">
              <i className="bi bi-person-bounding-box me-2"></i>
              Photo de profil (optionnel)
            </label>
            <div className="row g-2">
              {availableAvatars.map((avatarPath) => {
                const avatarName = avatarPath.split('/').pop()?.replace('.png', '');
                const isSelected = avatar === avatarPath;

                return (
                  <div key={avatarPath} className="col-4 col-md-4">
                    <button
                      type="button"
                      onClick={() => setAvatar(avatarPath)}
                      disabled={loading}
                      className={`btn w-100 p-2 ${
                        isSelected ? 'btn-primary' : 'btn-outline-secondary'
                      }`}
                    >
                      <Image
                        src={avatarPath}
                        alt={avatarName || 'Avatar'}
                        width={60}
                        height={60}
                        className="rounded-circle mb-1"
                        style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
                      />
                      <small className="d-block text-truncate">{avatarName}</small>
                    </button>
                  </div>
                );
              })}
              <div className="col-4 col-md-4">
                <button
                  type="button"
                  onClick={() => setAvatar('')}
                  disabled={loading}
                  className={`btn w-100 p-2 ${
                    !avatar ? 'btn-primary' : 'btn-outline-secondary'
                  }`}
                >
                  <div
                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mb-1 mx-auto"
                    style={{ width: '60px', height: '60px' }}
                  >
                    <i className="bi bi-person-fill text-white" style={{ fontSize: '1.5rem' }}></i>
                  </div>
                  <small className="d-block">Aucun</small>
                </button>
              </div>
            </div>
          </div>

          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              <i className="bi bi-person-plus me-2"></i>
              {loading ? 'Création en cours...' : 'Créer l\'administrateur'}
            </button>
          </div>
        </form>

        <div className="alert alert-info mt-4 mb-0">
          <i className="bi bi-info-circle me-2"></i>
          <strong>Note :</strong> Les nouveaux administrateurs auront accès à toutes les fonctionnalités d&apos;administration.
        </div>
      </div>
    </div>
  );
}
