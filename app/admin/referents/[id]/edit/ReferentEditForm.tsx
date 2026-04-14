'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Credential {
  id: string;
  serviceName: string;
  login: string;
  passwordEncrypted: string;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
}

interface ReferentEditFormProps {
  referent: {
    id: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    credentials: Credential[];
    personalLinks: LinkItem[];
    _count: {
      vendeurs: number;
    };
  };
  availableAvatars: string[];
}

export default function ReferentEditForm({ referent, availableAvatars }: ReferentEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [email, setEmail] = useState(referent.email);
  const [phone, setPhone] = useState(referent.phone || '');
  const [avatar, setAvatar] = useState(referent.avatar || '');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  // État pour les identifiants
  const [credentials, setCredentials] = useState(referent.credentials);
  const [newCredential, setNewCredential] = useState({
    serviceName: '',
    login: '',
    password: '',
  });

  // État pour les liens
  const [links, setLinks] = useState(referent.personalLinks);
  const [newLink, setNewLink] = useState({ title: '', url: '' });

  // État pour les mots de passe révélés
  const [revealedPasswords, setRevealedPasswords] = useState<{
    [key: string]: string;
  }>({});

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sauvegarder les informations de base
      const patchResponse = await fetch(`/api/referents/${referent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone: phone.trim() !== '' ? phone : null,
          avatar: avatar || null,
          newPassword: newPassword.trim() !== '' ? newPassword : undefined,
        }),
      });

      if (!patchResponse.ok) {
        const data = await patchResponse.json();
        setError(data.error || 'Erreur lors de la mise à jour');
        setLoading(false);
        return;
      }

      // Sauvegarder les identifiants et liens
      const putResponse = await fetch(`/api/referents/${referent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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

      if (putResponse.ok) {
        alert('✅ Référent mis à jour avec succès !');
        router.push('/admin/referents');
        router.refresh();
      } else {
        setError('Erreur lors de la sauvegarde des identifiants et liens');
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row">
      <div className="col-md-8">
        <div className="card">
          <div className="card-header bg-white">
            <h5 className="mb-0">
              <i className="bi bi-pencil me-2"></i>
              Informations du référent
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
                />
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
                <label className="form-label fw-semibold">
                  <i className="bi bi-person-bounding-box me-2"></i>
                  Photo de profil
                </label>
                <div className="row g-2">
                  {availableAvatars.map((avatarPath) => {
                    const avatarName = avatarPath.split('/').pop()?.replace('.png', '');
                    const isSelected = avatar === avatarPath;

                    return (
                      <div key={avatarPath} className="col-4 col-md-3">
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
                            width={80}
                            height={80}
                            className="rounded-circle mb-1"
                            style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
                          />
                          <small className="d-block text-truncate">{avatarName}</small>
                        </button>
                      </div>
                    );
                  })}
                  <div className="col-4 col-md-3">
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
                        style={{ width: '80px', height: '80px' }}
                      >
                        <i className="bi bi-person-fill text-white" style={{ fontSize: '2rem' }}></i>
                      </div>
                      <small className="d-block">Aucun</small>
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-cloud-upload me-2"></i>
                    Ou uploader une photo personnalisée
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
                      <p className="small text-muted mb-2">Aperçu de la photo uploadée :</p>
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
              </div>

              <div className="mb-4">
                <label htmlFor="newPassword" className="form-label fw-semibold">
                  <i className="bi bi-key me-2"></i>
                  Nouveau mot de passe (optionnel)
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Laissez vide pour ne pas changer"
                  minLength={6}
                />
                {newPassword && (
                  <small className="text-muted">
                    Minimum 6 caractères
                  </small>
                )}
              </div>

            </form>
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
                            <button
                              onClick={() => handleDeleteCredential(cred.id)}
                              className="btn btn-sm btn-outline-danger"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

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
          </div>
        </div>

        {/* Section Liens personnalisés */}
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
                          <button
                            onClick={() => handleDeleteLink(link.id)}
                            className="btn btn-sm btn-outline-danger"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

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
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="d-flex gap-2">
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={loading}
          >
            <i className="bi bi-check-circle me-2"></i>
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
          <Link
            href="/admin/referents"
            className="btn btn-outline-secondary"
          >
            <i className="bi bi-x-circle me-2"></i>
            Annuler
          </Link>
        </div>
      </div>

      <div className="col-md-4">
        <div className="card">
          <div className="card-header bg-white">
            <h5 className="mb-0">
              <i className="bi bi-info-circle me-2"></i>
              Informations
            </h5>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <small className="text-muted d-block mb-1">Nombre de vendeurs</small>
              <div className="d-flex align-items-center">
                <i className="bi bi-people-fill text-primary me-2" style={{ fontSize: '1.5rem' }}></i>
                <h4 className="mb-0">{referent._count.vendeurs}</h4>
              </div>
            </div>

            <hr />

            <div className="alert alert-warning mb-0">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <small>
                <strong>Attention :</strong> La modification de l&apos;email ou du mot de passe affectera la connexion du référent.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
