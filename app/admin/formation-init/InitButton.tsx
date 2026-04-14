'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function InitButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleInit = async () => {
    const confirmed = confirm(
      'Êtes-vous sûr de vouloir initialiser les 9 modules de formation dans la base de données ?'
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch('/api/training/init-modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.message}\n\n${data.count} modules créés avec succès !`);
        router.refresh();
      } else {
        alert(`❌ Erreur : ${data.error}`);
      }
    } catch (error) {
      alert('❌ Erreur lors de l\'initialisation des modules');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleInit}
      className="btn btn-primary btn-lg w-100"
      disabled={loading}
    >
      <i className="bi bi-plus-circle me-2"></i>
      {loading ? 'Initialisation en cours...' : 'Initialiser les 9 modules de formation'}
    </button>
  );
}
