'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AvailabilityToggleProps {
  initialAvailability: boolean;
}

export default function AvailabilityToggle({ initialAvailability }: AvailabilityToggleProps) {
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(initialAvailability);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/availability/toggle', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setIsAvailable(data.isAvailable);
        router.refresh();
      } else {
        alert('Erreur lors du changement de disponibilité');
      }
    } catch (error) {
      alert('Erreur lors du changement de disponibilité');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`btn btn-lg w-100 ${
        isAvailable ? 'btn-danger' : 'btn-success'
      }`}
      style={{ fontSize: '1.1rem', fontWeight: 'bold' }}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2"></span>
          Chargement...
        </>
      ) : isAvailable ? (
        <>
          <i className="bi bi-x-circle-fill me-2"></i>
          Je ne suis plus disponible
        </>
      ) : (
        <>
          <i className="bi bi-check-circle-fill me-2"></i>
          Je suis disponible aujourd&apos;hui
        </>
      )}
    </button>
  );
}
