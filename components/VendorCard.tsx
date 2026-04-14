import Link from 'next/link';

interface VendorCardProps {
  id: string;
  email: string;
  createdAt: Date;
  hasConfiguration: boolean;
  editUrl: string;
  onDelete?: () => void;
  showDeleteButton?: boolean;
}

export default function VendorCard({
  id,
  email,
  createdAt,
  hasConfiguration,
  editUrl,
  onDelete,
  showDeleteButton = true,
}: VendorCardProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="card card-vendor h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="card-title mb-1">{email}</h5>
            <p className="text-muted small mb-0">
              <i className="bi bi-calendar3 me-1"></i>
              Créé le : {formattedDate}
            </p>
          </div>
        </div>

        <div className="mb-3">
          {hasConfiguration ? (
            <span className="badge-configured">
              <i className="bi bi-check-circle me-1"></i>
              Infos configurées
            </span>
          ) : (
            <span className="badge bg-secondary">
              <i className="bi bi-exclamation-circle me-1"></i>
              Non configuré
            </span>
          )}
        </div>

        <div className="d-flex gap-2">
          <Link href={`${editUrl}?view=true`} className="btn btn-primary btn-sm flex-grow-1">
            <i className="bi bi-eye me-1"></i>
            Consulter
          </Link>
          <Link href={editUrl} className="btn btn-info btn-sm flex-grow-1">
            <i className="bi bi-pencil me-1"></i>
            Éditer
          </Link>
          {showDeleteButton && onDelete && (
            <button onClick={onDelete} className="btn btn-danger btn-sm">
              <i className="bi bi-trash"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
