'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DeleteReferentButtonProps {
  referentId: string;
  referentEmail: string;
}

export default function DeleteReferentButton({ referentId, referentEmail }: DeleteReferentButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le référent ${referentEmail} ? Tous ses vendeurs seront également supprimés.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/referents/${referentId}`, {
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
    <button
      onClick={handleDelete}
      className="btn btn-danger btn-sm w-100 mt-2"
      disabled={loading}
    >
      <i className="bi bi-trash me-1"></i>
      {loading ? 'Suppression...' : 'Supprimer'}
    </button>
  );
}
