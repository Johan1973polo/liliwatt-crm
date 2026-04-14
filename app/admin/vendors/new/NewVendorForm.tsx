'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Referent {
  id: string;
  email: string;
}

export default function NewVendorForm({ referents }: { referents: Referent[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    referentId: '',
    courtierNumber: '',
    avatar: '',
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille (max 5MB)
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

    if (!formData.email || !formData.firstName || !formData.lastName || !formData.password || !formData.referentId || !formData.courtierNumber) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        // Rediriger vers la page d'édition pour ajouter les identifiants/liens
        router.push(`/admin/vendors/${data.vendor.id}/edit`);
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
            <label className="form-label fw-semibold">Prénom <span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder="Thomas"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              disabled={loading}
            />
            <div className="form-text">Prénom affiché publiquement (anonymat)</div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Nom <span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              placeholder="Dupont"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              disabled={loading}
            />
            <div className="form-text">Nom de famille (usage interne)</div>
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
              <i className="bi bi-hash me-2"></i>
              Numéro de courtier <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              className="form-control"
              placeholder="Ex: 47"
              value={formData.courtierNumber}
              onChange={(e) => setFormData({ ...formData, courtierNumber: e.target.value })}
              required
              disabled={loading}
              min="1"
            />
            <div className="form-text">
              Numéro unique du courtier (ex: 47, 48, 49...) - Ne peut pas être modifié après création
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              <i className="bi bi-person-badge me-2"></i>
              Référent <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              value={formData.referentId}
              onChange={(e) => setFormData({ ...formData, referentId: e.target.value })}
              required
              disabled={loading}
            >
              <option value="">Sélectionner un référent</option>
              {referents.map((referent) => (
                <option key={referent.id} value={referent.id}>
                  {referent.email}
                </option>
              ))}
            </select>
            <div className="form-text">Le référent qui supervisera ce vendeur</div>
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
          {loading ? 'Création...' : 'Créer le vendeur'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="btn btn-outline-secondary"
          disabled={loading}
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
