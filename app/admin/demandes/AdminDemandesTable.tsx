'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Request {
  id: string;
  type: string;
  status: string;
  createdAt: Date;
  user: { email: string };
  vendor?: { email: string } | null;
  payloadJson: string;
}

const REQUEST_TYPE_LABELS: Record<string, string> = {
  DATA_BASE: 'Base de données',
  INVOICE: 'Facture',
  INTEGRATION: 'Intégration',
  PROBLEME_TECHNIQUE: 'Problème technique',
  SOUTIEN_TECHNIQUE: 'Soutien technique',
  FIN_COLLABORATION: 'Fin de collaboration',
};

const REQUEST_TYPE_COLORS: Record<string, string> = {
  DATA_BASE: 'success',
  INVOICE: 'warning',
  INTEGRATION: 'primary',
  PROBLEME_TECHNIQUE: 'danger',
  SOUTIEN_TECHNIQUE: 'secondary',
  FIN_COLLABORATION: 'dark',
};

const STATUS_LABELS: Record<string, string> = {
  NEW: 'Nouvelle',
  IN_PROGRESS: 'En cours',
  DONE: 'Effectuée',
};

export default function AdminDemandesTable({ requests }: { requests: Request[] }) {
  const router = useRouter();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('NEW');

  const filteredRequests = requests.filter((req) => {
    if (filterType !== 'ALL' && req.type !== filterType) return false;
    if (filterStatus !== 'ALL' && req.status !== filterStatus) return false;
    return true;
  });

  const handleMarkAsDone = async (requestId: string) => {
    if (!confirm('Marquer cette demande comme effectuée ?')) return;

    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DONE' }),
      });

      if (response.ok) {
        alert('✅ Demande marquée comme effectuée !');
        router.refresh();
      } else {
        alert('❌ Erreur lors de la mise à jour');
      }
    } catch (error) {
      alert('❌ Erreur réseau');
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="row g-2">
          <div className="col-md-4">
            <label className="form-label small mb-1">Type</label>
            <select
              className="form-select form-select-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">Tous les types</option>
              <option value="DATA_BASE">Base de données</option>
              <option value="INVOICE">Facture</option>
              <option value="INTEGRATION">Intégration</option>
              <option value="PROBLEME_TECHNIQUE">Problème technique</option>
              <option value="SOUTIEN_TECHNIQUE">Soutien technique</option>
              <option value="FIN_COLLABORATION">Fin de collaboration</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small mb-1">Statut</label>
            <select
              className="form-select form-select-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Tous les statuts</option>
              <option value="NEW">Nouvelles</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="DONE">Effectuées</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small mb-1">&nbsp;</label>
            <div className="text-muted small">
              <i className="bi bi-info-circle me-1"></i>
              {filteredRequests.length} demande(s)
            </div>
          </div>
        </div>
      </div>
      <div className="card-body p-0">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-inbox display-4"></i>
            <p className="mt-3">Aucune demande à afficher</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Type</th>
                  <th>Référent</th>
                  <th>Concerné</th>
                  <th>Détails</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => {
                  const payload = JSON.parse(req.payloadJson);
                  return (
                    <tr key={req.id}>
                      <td>
                        <span className={`badge bg-${REQUEST_TYPE_COLORS[req.type] || 'info'}`}>
                          {REQUEST_TYPE_LABELS[req.type] || req.type}
                        </span>
                      </td>
                      <td>
                        <small>{req.user.email}</small>
                      </td>
                      <td>
                        <small>{req.vendor?.email || (payload.vendorEmail ? payload.vendorEmail : 'Moi-même')}</small>
                      </td>
                      <td>
                        {req.type === 'INTEGRATION' ? (
                          <div className="small">
                            <div><strong>{payload.recrueName} {payload.recrueFirstName}</strong></div>
                            <div><i className="bi bi-telephone me-1"></i>{payload.recruePhone}</div>
                            <div><i className="bi bi-envelope me-1"></i>{payload.recrueEmail}</div>
                            {payload.microEntrepriseAssistance && (
                              <div className="text-primary">
                                <i className="bi bi-building me-1"></i>
                                Assistance micro-entreprise
                              </div>
                            )}
                            {payload.description && (
                              <div className="text-muted mt-1">{payload.description}</div>
                            )}
                          </div>
                        ) : req.type === 'FIN_COLLABORATION' ? (
                          <div className="small">
                            <div><strong>Raison :</strong> {payload.description || '-'}</div>
                          </div>
                        ) : (
                          <small>{payload.description || '-'}</small>
                        )}
                      </td>
                      <td>
                        <small>
                          {new Date(req.createdAt).toLocaleDateString('fr-FR')}
                        </small>
                      </td>
                      <td>
                        {req.status === 'NEW' && (
                          <span className="badge bg-warning">Nouvelle</span>
                        )}
                        {req.status === 'IN_PROGRESS' && (
                          <span className="badge bg-primary">En cours</span>
                        )}
                        {req.status === 'DONE' && (
                          <span className="badge bg-success">Effectuée</span>
                        )}
                      </td>
                      <td>
                        {req.status !== 'DONE' && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleMarkAsDone(req.id)}
                          >
                            <i className="bi bi-check2 me-1"></i>
                            Effectuée
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
