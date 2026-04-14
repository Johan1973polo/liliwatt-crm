'use client';

interface Declaration {
  id: string;
  type: string;
  societe: string;
  details: any;
  createdAt: string;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    courtierNumber: number | null;
  };
}

export default function RecentDeclarations({ declarations }: { declarations: Declaration[] }) {
  if (declarations.length === 0) {
    return (
      <div className="card mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">
            <i className="bi bi-clock-history me-2 text-primary"></i>
            Declarations recentes
          </h5>
        </div>
        <div className="card-body text-center text-muted py-4">
          Aucune declaration pour le moment.
        </div>
      </div>
    );
  }

  const factures = declarations.filter((d) => d.type === 'FACTURE');
  const ventes = declarations.filter((d) => d.type === 'VENTE');

  return (
    <div className="card mb-4">
      <div className="card-header bg-white">
        <h5 className="mb-0">
          <i className="bi bi-clock-history me-2 text-primary"></i>
          Declarations recentes
        </h5>
      </div>
      <div className="card-body">
        <div className="row g-4">
          {/* Factures récupérées */}
          <div className="col-md-6">
            <h6 className="mb-3">
              <i className="bi bi-file-earmark-text me-2"></i>
              Factures recuperees ({factures.length})
            </h6>
            {factures.length === 0 ? (
              <p className="text-muted small">Aucune facture recente</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {factures.slice(0, 10).map((d) => (
                  <div key={d.id} className="d-flex justify-content-between align-items-center p-2 rounded" style={{ background: '#f8f5ff' }}>
                    <div>
                      <strong>{d.user.firstName || d.user.email.split('@')[0]}</strong>
                      {d.user.courtierNumber && <span className="badge bg-primary ms-1" style={{ fontSize: '0.65rem' }}>N{d.user.courtierNumber}</span>}
                      <br />
                      <small className="text-muted">{d.societe} - {d.details?.energyType || 'elec'}</small>
                    </div>
                    <small className="text-muted">
                      {new Date(d.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ventes déclarées */}
          <div className="col-md-6">
            <h6 className="mb-3">
              <i className="bi bi-trophy me-2"></i>
              Ventes declarees ({ventes.length})
            </h6>
            {ventes.length === 0 ? (
              <p className="text-muted small">Aucune vente recente</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {ventes.slice(0, 10).map((d) => (
                  <div key={d.id} className="d-flex justify-content-between align-items-center p-2 rounded" style={{ background: '#fdf4ff' }}>
                    <div>
                      <strong>{d.user.firstName || d.user.email.split('@')[0]}</strong>
                      {d.user.courtierNumber && <span className="badge bg-primary ms-1" style={{ fontSize: '0.65rem' }}>N{d.user.courtierNumber}</span>}
                      <br />
                      <small className="text-muted">{d.societe} - {d.details?.fournisseur} ({d.details?.segment})</small>
                    </div>
                    <small className="text-muted">
                      {new Date(d.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
