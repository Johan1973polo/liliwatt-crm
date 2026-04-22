'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Admin {
  id: string;
  email: string;
  phone?: string | null;
  specialty?: string | null;
  isActive: boolean;
  createdAt: Date;
}

interface AdminsListProps {
  admins: Admin[];
  currentUserId: string;
}

export default function AdminsList({ admins, currentUserId }: AdminsListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleDelete = async (admin: Admin) => {
    // Vérifier si c'est le compte actuel
    if (admin.id === currentUserId) {
      alert('Vous ne pouvez pas supprimer votre propre compte !');
      return;
    }

    // Confirmation
    const confirmed = confirm(
      `Êtes-vous sûr de vouloir supprimer l'administrateur ${admin.email} ?\n\n` +
        'Cette action est irréversible et supprimera :\n' +
        '- Le compte utilisateur\n' +
        '- Tous ses messages\n' +
        '- Toutes ses notifications\n' +
        '- Tous ses événements du calendrier\n\n' +
        'L\'adresse email sera libérée et pourra être réutilisée.'
    );

    if (!confirmed) return;

    setDeletingId(admin.id);

    try {
      const response = await fetch(`/api/admin/users/${admin.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        alert('Administrateur supprimé avec succès !');
        router.refresh();
      } else {
        alert(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="card">
      <div className="card-header bg-white">
        <h5 className="mb-0">
          <i className="bi bi-people me-2"></i>
          Administrateurs actuels ({admins.length})
        </h5>
      </div>
      <div className="card-body">
        {admins.length === 0 ? (
          <p className="text-muted mb-0">Aucun administrateur trouvé.</p>
        ) : (
          <div className="list-group list-group-flush">
            {admins.map((admin) => (
              <div key={admin.id} className="list-group-item px-0">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-1">
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7c3aed, #d946ef)',
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '13px', marginRight: '10px', flexShrink: 0,
                      }}>
                        {admin.email.substring(0, 2).toUpperCase()}
                      </div>
                      <strong>{admin.email}</strong>
                      {admin.specialty && (
                        <span className="badge bg-info ms-2">{admin.specialty}</span>
                      )}
                      {!admin.isActive && (
                        <span className="badge bg-secondary ms-2">Inactif</span>
                      )}
                      {admin.id === currentUserId && (
                        <span className="badge bg-success ms-2">Vous</span>
                      )}
                    </div>
                    {admin.phone && (
                      <p className="text-muted small mb-1">
                        <i className="bi bi-telephone me-1"></i>
                        {admin.phone}
                      </p>
                    )}
                    <p className="text-muted small mb-0">
                      <i className="bi bi-calendar me-1"></i>
                      Créé le {formatDate(admin.createdAt)}
                    </p>
                  </div>

                  {/* Boutons d'action */}
                  <div className="d-flex gap-2">
                    {/* Bouton Éditer */}
                    <button
                      onClick={() => router.push(`/admin/users/${admin.id}/edit`)}
                      className="btn btn-sm btn-outline-primary"
                      title="Modifier cet administrateur"
                    >
                      <i className="bi bi-pencil me-1"></i>
                      Éditer
                    </button>

                    {/* Bouton Supprimer (seulement pour les autres admins) */}
                    {admin.id !== currentUserId && (
                      <button
                        onClick={() => handleDelete(admin)}
                        disabled={deletingId === admin.id}
                        className="btn btn-sm btn-outline-danger"
                        title="Supprimer cet administrateur"
                      >
                        {deletingId === admin.id ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-1"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Suppression...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-trash me-1"></i>
                            Supprimer
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
