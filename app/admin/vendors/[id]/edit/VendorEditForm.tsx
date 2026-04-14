'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Credential {
  id: string;
  serviceName: string;
  login: string;
  passwordEncrypted: string;
}

interface Link {
  id: string;
  title: string;
  url: string;
}

interface VendorEditFormProps {
  vendor: {
    id: string;
    email: string;
    avatar?: string | null;
    credentials: Credential[];
    personalLinks: Link[];
  };
  isViewMode: boolean;
  backUrl: string;
  hideLinks?: boolean;
}

export default function VendorEditForm({ vendor, isViewMode, backUrl, hideLinks = false }: VendorEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(vendor.avatar || null);
  const [avatar, setAvatar] = useState(vendor.avatar || '');

  // État pour les identifiants
  const [credentials, setCredentials] = useState(vendor.credentials);
  const [newCredential, setNewCredential] = useState({
    serviceName: '',
    login: '',
    password: '',
  });

  // État pour les liens
  const [links, setLinks] = useState(vendor.personalLinks);
  const [newLink, setNewLink] = useState({ title: '', url: '' });

  // État pour les mots de passe révélés
  const [revealedPasswords, setRevealedPasswords] = useState<{
    [key: string]: string;
  }>({});

  // Gérer l'upload de l'avatar
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
        setAvatar(data.avatarUrl);
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

  // Ajouter un identifiant
  const handleAddCredential = () => {
    if (!newCredential.serviceName || !newCredential.login) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const tempId = `temp-${Date.now()}`;
    setCredentials([
      ...credentials,
      {
        id: tempId,
        serviceName: newCredential.serviceName,
        login: newCredential.login,
        passwordEncrypted: newCredential.password || 'EN ATTENTE',
      },
    ]);

    setNewCredential({ serviceName: '', login: '', password: '' });
  };

  // Supprimer un identifiant
  const handleDeleteCredential = (id: string) => {
    setCredentials(credentials.filter((c) => c.id !== id));
  };

  // Ajouter un lien
  const handleAddLink = () => {
    if (!newLink.title || !newLink.url) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const tempId = `temp-${Date.now()}`;
    setLinks([
      ...links,
      {
        id: tempId,
        title: newLink.title,
        url: newLink.url,
      },
    ]);

    setNewLink({ title: '', url: '' });
  };

  // Supprimer un lien
  const handleDeleteLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
  };

  // Révéler un mot de passe
  const handleRevealPassword = async (credentialId: string) => {
    if (revealedPasswords[credentialId]) {
      // Masquer
      const updated = { ...revealedPasswords };
      delete updated[credentialId];
      setRevealedPasswords(updated);
      return;
    }

    // Demander confirmation
    if (!confirm('Afficher le mot de passe ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/credentials/${credentialId}/reveal`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setRevealedPasswords({
          ...revealedPasswords,
          [credentialId]: data.password,
        });
      } else {
        alert('Erreur lors de la révélation du mot de passe');
      }
    } catch (error) {
      alert('Erreur lors de la révélation du mot de passe');
    }
  };

  // Sauvegarder
  const handleSave = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/vendors/${vendor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatar,
          credentials: credentials.map((c) => ({
            id: c.id.startsWith('temp-') ? undefined : c.id,
            serviceName: c.serviceName,
            login: c.login,
            password: c.passwordEncrypted,
          })),
          links: links.map((l) => ({
            id: l.id.startsWith('temp-') ? undefined : l.id,
            title: l.title,
            url: l.url,
          })),
        }),
      });

      if (response.ok) {
        router.push(backUrl);
        router.refresh();
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Section Informations de base */}
      <div className="card mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">
            <i className="bi bi-info-circle me-2"></i>
            Informations de base
          </h5>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              className="form-control"
              value={vendor.email}
              disabled
            />
          </div>

          {!isViewMode && (
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
                      setAvatar('');
                    }}
                    disabled={loading}
                  >
                    <i className="bi bi-trash"></i> Retirer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Section Identifiants et Accès */}
      <div className="card mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">
            <i className="bi bi-key me-2"></i>
            Identifiants et Accès
          </h5>
        </div>
        <div className="card-body">
          {credentials.length > 0 && (
            <div className="table-responsive mb-3">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Nom du service</th>
                    <th>Identifiant</th>
                    <th>Mot de passe</th>
                    <th style={{ width: '100px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {credentials.map((cred) => (
                    <tr key={cred.id}>
                      <td className="align-middle">{cred.serviceName}</td>
                      <td className="align-middle">{cred.login}</td>
                      <td className="align-middle">
                        {revealedPasswords[cred.id] ? (
                          <code>{revealedPasswords[cred.id]}</code>
                        ) : (
                          <span className="password-masked">•••••••••</span>
                        )}
                      </td>
                      <td className="align-middle">
                        <div className="d-flex gap-2">
                          {!cred.id.startsWith('temp-') && (
                            <button
                              onClick={() => handleRevealPassword(cred.id)}
                              className="btn btn-sm btn-outline-secondary"
                              disabled={isViewMode}
                              title="Afficher/masquer le mot de passe"
                            >
                              <i
                                className={
                                  revealedPasswords[cred.id]
                                    ? 'bi bi-eye-slash'
                                    : 'bi bi-eye'
                                }
                              ></i>
                            </button>
                          )}
                          {!isViewMode && (
                            <button
                              onClick={() => handleDeleteCredential(cred.id)}
                              className="btn btn-sm btn-outline-danger"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isViewMode && (
            <div className="border rounded p-3 bg-light">
              <h6 className="mb-3">Ajouter un identifiant</h6>
              <div className="row g-3">
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nom du service"
                    value={newCredential.serviceName}
                    onChange={(e) =>
                      setNewCredential({ ...newCredential, serviceName: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Identifiant"
                    value={newCredential.login}
                    onChange={(e) =>
                      setNewCredential({ ...newCredential, login: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Mot de passe (ou 'EN ATTENTE')"
                    value={newCredential.password}
                    onChange={(e) =>
                      setNewCredential({ ...newCredential, password: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-2">
                  <button
                    onClick={handleAddCredential}
                    className="btn btn-primary w-100"
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section Liens personnalisés (masquée pour les référents) */}
      {!hideLinks && (
        <div className="card mb-4">
          <div className="card-header bg-white">
            <h5 className="mb-0">
              <i className="bi bi-link-45deg me-2"></i>
              Liens personnalisés
            </h5>
          </div>
          <div className="card-body">
            {links.length > 0 && (
              <div className="table-responsive mb-3">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>URL</th>
                      <th style={{ width: '80px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {links.map((link) => (
                      <tr key={link.id}>
                        <td className="align-middle">{link.title}</td>
                        <td className="align-middle">
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            {link.url}
                          </a>
                        </td>
                        <td className="align-middle">
                          {!isViewMode && (
                            <button
                              onClick={() => handleDeleteLink(link.id)}
                              className="btn btn-sm btn-outline-danger"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!isViewMode && (
              <div className="border rounded p-3 bg-light">
                <h6 className="mb-3">Ajouter un lien</h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nom du lien"
                      value={newLink.title}
                      onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="url"
                      className="form-control"
                      placeholder="URL"
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    />
                  </div>
                  <div className="col-md-2">
                    <button onClick={handleAddLink} className="btn btn-primary w-100">
                      <i className="bi bi-plus-circle me-1"></i>
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="d-flex gap-3">
        {!isViewMode && (
          <button onClick={handleSave} className="btn btn-primary" disabled={loading}>
            <i className="bi bi-save me-2"></i>
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        )}
        <button
          onClick={() => router.push(backUrl)}
          className="btn btn-outline-secondary"
        >
          {isViewMode ? 'Retour' : 'Annuler'}
        </button>
      </div>
    </div>
  );
}
