'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Module {
  id: string;
  title: string;
  order: number;
  icon: string;
}

interface Seller {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  courtierNumber: number | null;
  createdAt: Date;
  trainingProgress: Array<{
    id: string;
    moduleId: string;
    status: string;
    unlockedAt: Date | null;
    completedAt: Date | null;
    score: number | null;
    module: {
      title: string;
      order: number;
    };
    unlocker: {
      firstName: string | null;
      lastName: string | null;
    } | null;
  }>;
}

interface TrainingManagementProps {
  modules: Module[];
  sellers: Seller[];
  userRole: string;
}

export default function TrainingManagement({ modules, sellers, userRole }: TrainingManagementProps) {
  const router = useRouter();
  const [selectedSeller, setSelectedSeller] = useState<string | null>(
    sellers.length > 0 ? sellers[0].id : null
  );
  const [loading, setLoading] = useState(false);

  const currentSeller = sellers.find(s => s.id === selectedSeller);

  // Créer un map de progression pour le vendeur sélectionné
  const progressMap = new Map(
    currentSeller?.trainingProgress.map(p => [p.moduleId, p]) || []
  );

  const handleUnlockModule = async (moduleId: string) => {
    if (!selectedSeller) return;

    const confirmed = confirm('Voulez-vous déverrouiller ce module pour ce vendeur ?');
    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch('/api/training/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: selectedSeller,
          moduleIds: [moduleId],
          action: 'unlock',
        }),
      });

      if (response.ok) {
        alert('✅ Module déverrouillé avec succès !');
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors du déverrouillage');
      }
    } catch (error) {
      alert('Erreur lors du déverrouillage');
    } finally {
      setLoading(false);
    }
  };

  const handleLockModule = async (moduleId: string) => {
    if (!selectedSeller) return;

    const confirmed = confirm('Voulez-vous verrouiller ce module pour ce vendeur ?');
    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch('/api/training/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: selectedSeller,
          moduleIds: [moduleId],
          action: 'lock',
        }),
      });

      if (response.ok) {
        alert('✅ Module verrouillé avec succès !');
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors du verrouillage');
      }
    } catch (error) {
      alert('Erreur lors du verrouillage');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockAll = async () => {
    if (!selectedSeller) return;

    const confirmed = confirm(
      'Voulez-vous déverrouiller TOUS les modules pour ce vendeur ? Cette action déverrouillera tous les modules verrouillés.'
    );
    if (!confirmed) return;

    setLoading(true);

    try {
      const lockedModuleIds = modules
        .filter(module => {
          const progress = progressMap.get(module.id);
          return !progress || progress.status === 'LOCKED';
        })
        .map(m => m.id);

      if (lockedModuleIds.length === 0) {
        alert('Tous les modules sont déjà déverrouillés.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/training/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: selectedSeller,
          moduleIds: lockedModuleIds,
          action: 'unlock',
        }),
      });

      if (response.ok) {
        alert(`✅ ${lockedModuleIds.length} module(s) déverrouillé(s) avec succès !`);
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors du déverrouillage');
      }
    } catch (error) {
      alert('Erreur lors du déverrouillage');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (moduleId: string) => {
    const progress = progressMap.get(moduleId);

    if (!progress || progress.status === 'LOCKED') {
      return (
        <span className="badge bg-secondary">
          <i className="bi bi-lock-fill me-1"></i>
          Verrouillé
        </span>
      );
    }

    switch (progress.status) {
      case 'UNLOCKED':
        return (
          <span className="badge bg-success">
            <i className="bi bi-unlock-fill me-1"></i>
            Déverrouillé
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="badge bg-warning text-dark">
            <i className="bi bi-hourglass-split me-1"></i>
            En cours
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="badge bg-primary">
            <i className="bi bi-check-circle-fill me-1"></i>
            Complété
          </span>
        );
      default:
        return null;
    }
  };

  const calculateProgress = (seller: Seller) => {
    const completed = seller.trainingProgress.filter(p => p.status === 'COMPLETED').length;
    return Math.round((completed / modules.length) * 100);
  };

  if (sellers.length === 0) {
    return (
      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        Aucun vendeur à gérer pour le moment.
      </div>
    );
  }

  return (
    <div className="row">
      {/* Liste des vendeurs */}
      <div className="col-lg-3">
        <div className="card">
          <div className="card-header bg-white">
            <h5 className="mb-0">
              <i className="bi bi-people me-2"></i>
              Vendeurs ({sellers.length})
            </h5>
          </div>
          <div className="list-group list-group-flush" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {sellers.map(seller => {
              const progress = calculateProgress(seller);
              return (
                <button
                  key={seller.id}
                  className={`list-group-item list-group-item-action ${
                    selectedSeller === seller.id ? 'active' : ''
                  }`}
                  onClick={() => setSelectedSeller(seller.id)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold">
                        {seller.firstName} {seller.lastName}
                      </div>
                      <small className={selectedSeller === seller.id ? 'text-white-50' : 'text-muted'}>
                        {seller.courtierNumber ? `N°${seller.courtierNumber}` : seller.email}
                      </small>
                      {(seller as any).role === 'REFERENT' && (
                        <span className="badge ms-2" style={{ background: '#3b82f6', fontSize: '0.65rem' }}>Référent</span>
                      )}
                      {(seller as any).role === 'VENDEUR' && (
                        <span className="badge ms-2" style={{ background: '#7c3aed', fontSize: '0.65rem' }}>Vendeur</span>
                      )}
                    </div>
                    <span className={`badge ${selectedSeller === seller.id ? 'bg-light text-dark' : 'bg-primary'}`}>
                      {progress}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Détails et gestion */}
      <div className="col-lg-9">
        {currentSeller && (
          <>
            {/* En-tête vendeur */}
            <div className="card mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h4 className="mb-1">
                      {currentSeller.firstName} {currentSeller.lastName}
                    </h4>
                    <p className="text-muted mb-0">
                      {currentSeller.courtierNumber && `N°${currentSeller.courtierNumber} • `}
                      {currentSeller.email}
                    </p>
                  </div>
                  <button
                    onClick={handleUnlockAll}
                    className="btn btn-success"
                    disabled={loading}
                  >
                    <i className="bi bi-unlock me-2"></i>
                    Tout déverrouiller
                  </button>
                </div>

                {/* Barre de progression */}
                <div className="mt-3">
                  <div className="d-flex justify-content-between mb-1">
                    <small className="text-muted">Progression globale</small>
                    <small className="text-muted">
                      {currentSeller.trainingProgress.filter(p => p.status === 'COMPLETED').length}/
                      {modules.length} modules
                    </small>
                  </div>
                  <div className="progress" style={{ height: '20px' }}>
                    <div
                      className="progress-bar bg-success progress-bar-striped"
                      style={{ width: `${calculateProgress(currentSeller)}%` }}
                    >
                      <strong>{calculateProgress(currentSeller)}%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des modules */}
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-book me-2"></i>
                  Modules de formation
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '60px' }}>#</th>
                        <th>Module</th>
                        <th style={{ width: '150px' }}>Statut</th>
                        <th style={{ width: '200px' }}>Détails</th>
                        <th style={{ width: '150px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modules.map(module => {
                        const progress = progressMap.get(module.id);
                        const isLocked = !progress || progress.status === 'LOCKED';

                        return (
                          <tr key={module.id}>
                            <td className="text-center">
                              <i className={`bi ${module.icon} fs-4 text-primary`}></i>
                            </td>
                            <td>
                              <div className="fw-semibold">{module.title}</div>
                              <small className="text-muted">Module {module.order}</small>
                            </td>
                            <td>{getStatusBadge(module.id)}</td>
                            <td>
                              {progress && progress.unlockedAt && (
                                <small className="text-muted d-block">
                                  <i className="bi bi-unlock me-1"></i>
                                  Déverrouillé le{' '}
                                  {new Date(progress.unlockedAt).toLocaleDateString('fr-FR')}
                                </small>
                              )}
                              {progress && progress.completedAt && (
                                <small className="text-success d-block">
                                  <i className="bi bi-check-circle me-1"></i>
                                  Complété le{' '}
                                  {new Date(progress.completedAt).toLocaleDateString('fr-FR')}
                                </small>
                              )}
                              {progress && progress.score !== null && (
                                <small className="text-warning d-block">
                                  <i className="bi bi-star me-1"></i>
                                  Score: {progress.score}/100
                                </small>
                              )}
                            </td>
                            <td>
                              {isLocked ? (
                                <button
                                  onClick={() => handleUnlockModule(module.id)}
                                  className="btn btn-sm btn-success"
                                  disabled={loading}
                                >
                                  <i className="bi bi-unlock me-1"></i>
                                  Déverrouiller
                                </button>
                              ) : progress?.status !== 'COMPLETED' ? (
                                <button
                                  onClick={() => handleLockModule(module.id)}
                                  className="btn btn-sm btn-outline-secondary"
                                  disabled={loading}
                                >
                                  <i className="bi bi-lock me-1"></i>
                                  Verrouiller
                                </button>
                              ) : (
                                <span className="badge bg-light text-success">
                                  <i className="bi bi-check-circle-fill me-1"></i>
                                  Terminé
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
