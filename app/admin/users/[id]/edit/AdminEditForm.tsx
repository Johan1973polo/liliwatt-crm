'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Admin {
  id: string;
  email: string;
  phone?: string | null;
  specialty?: string | null;
  avatar?: string | null;
  isActive: boolean;
  createdAt: Date;
}

interface AdminEditFormProps {
  admin: Admin;
  availableAvatars: string[];
}

export default function AdminEditForm({ admin, availableAvatars }: AdminEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: admin.email,
    phone: admin.phone || '',
    specialty: admin.specialty || '',
    avatar: admin.avatar || '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérifier que les mots de passe correspondent si un nouveau mot de passe est fourni
    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        alert('Les mots de passe ne correspondent pas');
        return;
      }

      if (formData.password.length < 6) {
        alert('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${admin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
          specialty: formData.specialty,
          avatar: formData.avatar || null,
          password: formData.password, // Sera ignoré si vide
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Administrateur modifié avec succès !');
        router.push('/admin/users');
        router.refresh();
      } else {
        alert(data.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="card">
        <div className="card-header bg-white">
          <h5 className="mb-0">
            <i className="bi bi-info-circle me-2"></i>
            Informations de l&apos;administrateur
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {/* Email */}
            <div className="col-md-6">
              <label htmlFor="email" className="form-label fw-semibold">
                Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            {/* Téléphone */}
            <div className="col-md-6">
              <label htmlFor="phone" className="form-label fw-semibold">
                Téléphone
              </label>
              <input
                type="tel"
                className="form-control"
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="0612345678"
                disabled={loading}
              />
            </div>

            {/* Spécialité */}
            <div className="col-12">
              <label htmlFor="specialty" className="form-label fw-semibold">
                Spécialité / Fonction
              </label>
              <select
                className="form-select"
                id="specialty"
                value={formData.specialty}
                onChange={(e) =>
                  setFormData({ ...formData, specialty: e.target.value })
                }
                disabled={loading}
              >
                <option value="">Aucune spécialité</option>
                <option value="PRÉSIDENT">Président</option>
                <option value="DIRECTION COMMERCIALE">Direction Commerciale</option>
                <option value="DIRECTION TECHNIQUE">Direction Technique</option>
                <option value="DIRECTION ADMINISTRATIVE">Direction Administrative</option>
                <option value="RESPONSABLE RH">Responsable RH</option>
                <option value="RESPONSABLE MARKETING">Responsable Marketing</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>

            {/* Avatar */}
            <div className="col-12">
              <label className="form-label fw-semibold">
                Avatar
              </label>

              {/* Avatar actuel */}
              <div className="mb-3">
                {formData.avatar ? (
                  <div className="d-flex align-items-center">
                    <Image
                      src={formData.avatar}
                      alt="Avatar actuel"
                      width={64}
                      height={64}
                      className="rounded-circle me-3"
                      style={{ objectFit: 'cover' }}
                    />
                    <div>
                      <p className="mb-1 small text-muted">Avatar actuel</p>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, avatar: '' })}
                        className="btn btn-sm btn-outline-danger"
                        disabled={loading}
                      >
                        <i className="bi bi-trash me-1"></i>
                        Retirer l&apos;avatar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex align-items-center">
                    <div
                      className="rounded-circle bg-secondary d-flex align-items-center justify-content-center me-3"
                      style={{ width: '64px', height: '64px' }}
                    >
                      <i className="bi bi-person-fill text-white" style={{ fontSize: '2rem' }}></i>
                    </div>
                    <p className="mb-0 small text-muted">Aucun avatar sélectionné</p>
                  </div>
                )}
              </div>

              {/* Sélection d'avatar */}
              <div className="row g-2">
                {availableAvatars.map((avatar) => {
                  const avatarName = avatar.split('/').pop()?.replace('.png', '');
                  const isSelected = formData.avatar === avatar;

                  return (
                    <div key={avatar} className="col-4 col-md-3 col-lg-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, avatar })}
                        disabled={loading}
                        className={`btn w-100 p-2 ${
                          isSelected ? 'btn-primary' : 'btn-outline-secondary'
                        }`}
                      >
                        <Image
                          src={avatar}
                          alt={avatarName || 'Avatar'}
                          width={60}
                          height={60}
                          className="rounded-circle"
                          style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
                        />
                        <small className="d-block mt-1 text-truncate">{avatarName}</small>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="col-12">
              <hr className="my-2" />
              <p className="text-muted small mb-0">
                <i className="bi bi-info-circle me-1"></i>
                Laissez les champs de mot de passe vides si vous ne souhaitez pas le modifier
              </p>
            </div>

            {/* Nouveau mot de passe */}
            <div className="col-md-6">
              <label htmlFor="password" className="form-label fw-semibold">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Minimum 6 caractères"
                disabled={loading}
              />
            </div>

            {/* Confirmer le mot de passe */}
            <div className="col-md-6">
              <label htmlFor="confirmPassword" className="form-label fw-semibold">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="Répétez le mot de passe"
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="d-flex gap-3 mt-4">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Modification...
            </>
          ) : (
            <>
              <i className="bi bi-save me-2"></i>
              Enregistrer les modifications
            </>
          )}
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => router.push('/admin/users')}
          disabled={loading}
        >
          <i className="bi bi-x-circle me-2"></i>
          Annuler
        </button>
      </div>
    </form>
  );
}
