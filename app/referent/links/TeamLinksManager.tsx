'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Link {
  id: string;
  title: string;
  url: string;
  order: number;
}

export default function TeamLinksManager({ initialLinks }: { initialLinks: Link[] }) {
  const router = useRouter();
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [loading, setLoading] = useState(false);

  const handleAddLink = async () => {
    if (!newLink.title || !newLink.url) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/links/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLink),
      });

      if (response.ok) {
        setNewLink({ title: '', url: '' });
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
            Ajouter un nouveau lien pour votre équipe
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Nom du lien (ex: Drive Équipe)"
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="col-md-6">
              <input
                type="url"
                className="form-control"
                placeholder="URL (ex: https://drive.google.com/...)"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="col-md-2">
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
            Liens d&apos;équipe existants ({initialLinks.length})
          </h5>
        </div>
        <div className="card-body">
          {initialLinks.length === 0 ? (
            <p className="text-muted mb-0">Aucun lien d&apos;équipe pour le moment.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>Ordre</th>
                    <th>Nom</th>
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
