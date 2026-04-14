'use client';

import { useState } from 'react';

interface Credential {
  id: string;
  serviceName: string;
  login: string;
  passwordEncrypted: string;
}

export default function CredentialsBlock({ credentials }: { credentials: Credential[] }) {
  const [revealedPasswords, setRevealedPasswords] = useState<{
    [key: string]: string;
  }>({});

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

  return (
    <div className="card mb-4">
      <div className="card-header bg-white">
        <h5 className="mb-0">
          <i className="bi bi-key me-2"></i>
          Mes identifiants et accès
        </h5>
      </div>
      <div className="card-body">
        {credentials.length === 0 ? (
          <p className="text-muted mb-0">Aucun identifiant configuré pour le moment.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Identifiant</th>
                  <th>Mot de passe</th>
                  <th style={{ width: '60px' }}></th>
                </tr>
              </thead>
              <tbody>
                {credentials.map((cred) => (
                  <tr key={cred.id}>
                    <td className="align-middle fw-semibold">{cred.serviceName}</td>
                    <td className="align-middle">{cred.login}</td>
                    <td className="align-middle">
                      {revealedPasswords[cred.id] ? (
                        <code className="text-dark">{revealedPasswords[cred.id]}</code>
                      ) : (
                        <span className="password-masked">•••••••••</span>
                      )}
                    </td>
                    <td className="align-middle">
                      <button
                        onClick={() => handleRevealPassword(cred.id)}
                        className="btn btn-sm btn-outline-secondary"
                        title="Afficher/masquer le mot de passe"
                      >
                        <i
                          className={
                            revealedPasswords[cred.id] ? 'bi bi-eye-slash' : 'bi bi-eye'
                          }
                        ></i>
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
  );
}
