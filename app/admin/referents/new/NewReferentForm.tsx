'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function NewReferentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    avatar: '',
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image est trop volumineuse (max 5MB)');
      return;
    }

    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, avatar: data.avatarUrl }));
        setAvatarPreview(data.avatarUrl);
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de l\'upload');
      }
    } catch (error) {
      alert('Erreur lors de l\'upload de la photo');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.phone || !formData.password) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/referents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/referents');
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      alert('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="card mb-4">
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              className="form-control"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Téléphone</label>
            <input
              type="tel"
              className="form-control"
              placeholder="+33 6 12 34 56 78"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Mot de passe</label>
            <input
              type="password"
              className="form-control"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={loading}
              minLength={8}
            />
            <div className="form-text">Minimum 8 caractères</div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              <i className="bi bi-camera me-2"></i>
              Photo de profil (optionnel)
            </label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={loading || uploadingAvatar}
            />
            <div className="form-text">JPG, PNG ou GIF (max 5MB)</div>

            {uploadingAvatar && (
              <div className="mt-2">
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <small>Upload en cours...</small>
              </div>
            )}

            {avatarPreview && (
              <div className="mt-3">
                <p className="small text-muted mb-2">Aperçu :</p>
                <Image
                  src={avatarPreview}
                  alt="Aperçu"
                  width={100}
                  height={100}
                  className="rounded-circle"
                  style={{ objectFit: 'cover' }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger ms-3"
                  onClick={() => {
                    setAvatarPreview(null);
                    setFormData({ ...formData, avatar: '' });
                  }}
                  disabled={loading}
                >
                  <i className="bi bi-trash"></i> Retirer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="d-flex gap-3">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          <i className="bi bi-save me-2"></i>
          {loading ? 'Création...' : 'Créer le référent'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/referents')}
          className="btn btn-outline-secondary"
          disabled={loading}
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
