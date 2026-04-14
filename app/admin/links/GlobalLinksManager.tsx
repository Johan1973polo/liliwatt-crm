'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Link {
  id: string;
  title: string;
  url: string;
  order: number;
  scope: string;
}

export default function GlobalLinksManager({ initialLinks }: { initialLinks: Link[] }) {
  const router = useRouter();
  const [links, setLinks] = useState(initialLinks);
  const [newLink, setNewLink] = useState({ title: '', url: '', scope: 'GLOBAL' });
  const [loading, setLoading] = useState(false);

  const handleAddLink = async () => {
    if (!newLink.title || !newLink.url) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/links/global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLink),
      });

      if (response.ok) {
        setNewLink({ title: '', url: '', scope: 'GLOBAL' });
        router.refresh();
      } else {
        alert('Erreur lors de l&apos;ajout du lien');
      }
    } catch (error) {
      alert('Erreur lors de l&apos;ajout du lien');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('Supprimer ce lien ?')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      alert('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">
            <i className="bi bi-plus-circle me-2"></i>
            Ajouter un nouveau lien global
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-md-3">
              <label className="form-label fw-semibold small">Nom du lien</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ex: Formation"
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold small">Visible par</label>
              <select
                className="form-select"
                value={newLink.scope}
                onChange={(e) => setNewLink({ ...newLink, scope: e.target.value })}
                disabled={loading}
              >
                <option value="GLOBAL">Tous (Référents + Vendeurs)</option>
                <option value="GLOBAL_REFERENT">Référents uniquement</option>
                <option value="GLOBAL_VENDOR">Vendeurs uniquement</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold small">URL</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://formation.liliwatt.fr"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small">&nbsp;</label>
              <button
                onClick={handleAddLink}
                className="btn btn-primary w-100"
                disabled={loading}
              >
                <i className="bi bi-plus-circle me-1"></i>
                Ajouter
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header bg-white">
          <h5 className="mb-0">
            <i className="bi bi-list-ul me-2"></i>
            Liens globaux existants ({initialLinks.length})
          </h5>
        </div>
        <div className="card-body">
          {initialLinks.length === 0 ? (
            <p className="text-muted mb-0">Aucun lien global pour le moment.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>Ordre</th>
                    <th>Nom</th>
                    <th style={{ width: '180px' }}>Visible par</th>
                    <th>URL</th>
                    <th style={{ width: '100px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {initialLinks.map((link, index) => (
                    <tr key={link.id}>
                      <td className="align-middle text-center">{index + 1}</td>
                      <td className="align-middle fw-semibold">{link.title}</td>
                      <td className="align-middle">
                        {link.scope === 'GLOBAL' && (
                          <span className="badge bg-primary">Tous</span>
                        )}
                        {link.scope === 'GLOBAL_REFERENT' && (
                          <span className="badge bg-info">Référents</span>
                        )}
                        {link.scope === 'GLOBAL_VENDOR' && (
                          <span className="badge bg-success">Vendeurs</span>
                        )}
                      </td>
                      <td className="align-middle">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-decoration-none"
                        >
                          {link.url}
                          <i className="bi bi-box-arrow-up-right ms-1 small"></i>
                        </a>
                      </td>
                      <td className="align-middle">
                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          className="btn btn-sm btn-outline-danger"
                          disabled={loading}
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
        </div>
      </div>
    </div>
  );
}
