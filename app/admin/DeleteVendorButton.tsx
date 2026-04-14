'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DeleteVendorButtonProps {
  vendorId: string;
  vendorEmail: string;
  inline?: boolean;
}

export default function DeleteVendorButton({ vendorId, vendorEmail, inline = false }: DeleteVendorButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${vendorEmail} ?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/vendors/${vendorId}`, {
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

  if (inline) {
    return (
      <button
        onClick={handleDelete}
        className="btn btn-danger btn-sm"
        disabled={loading}
        title="Supprimer"
      >
        <i className="bi bi-trash"></i>
      </button>
    );
  }

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
