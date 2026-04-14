interface Link {
  id: string;
  title: string;
  url: string;
  scope: string;
}

export default function LinksBlock({ links }: { links: Link[] }) {
  return (
    <div className="card mb-4">
      <div className="card-header bg-white">
        <h5 className="mb-0">
          <i className="bi bi-link-45deg me-2"></i>
          Mes boutons / liens
        </h5>
      </div>
      <div className="card-body">
        {links.length === 0 ? (
          <p className="text-muted mb-0">Aucun lien disponible pour le moment.</p>
        ) : (
          <div className="d-grid gap-2">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary text-start"
              >
                <i className="bi bi-box-arrow-up-right me-2"></i>
                {link.title}
                {link.scope === 'GLOBAL' && (
                  <span className="badge bg-secondary ms-2">Global</span>
                )}
                {link.scope === 'GLOBAL_VENDOR' && (
                  <span className="badge bg-primary ms-2">Vendeurs</span>
                )}
                {link.scope === 'GLOBAL_REFERENT' && (
                  <span className="badge bg-info ms-2">Référents</span>
                )}
                {link.scope === 'TEAM' && (
                  <span className="badge bg-warning ms-2">Équipe</span>
                )}
                {link.scope === 'USER' && (
                  <span className="badge bg-success ms-2">Personnel</span>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
