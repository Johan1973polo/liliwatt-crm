'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ModuleContentProps {
  module: {
    id: string;
    title: string;
    description: string;
    content: string;
    order: number;
    icon: string;
    durationEstimated: number;
  };
  progress: {
    status: string;
    unlockedBy: string | null;
    unlockedAt: Date | null;
    startedAt: Date | null;
    completedAt: Date | null;
    score: number | null;
    unlocker?: {
      firstName: string | null;
      lastName: string | null;
      email: string;
    } | null;
  } | null;
  isAdmin: boolean;
}

export default function ModuleContent({ module, progress, isAdmin }: ModuleContentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleMarkComplete = async () => {
    const confirmed = confirm('Êtes-vous sûr d\'avoir terminé ce module ?');
    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch('/api/training/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: module.id,
          status: 'COMPLETED',
        }),
      });

      if (response.ok) {
        alert('✅ Module marqué comme complété !');
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      alert('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!progress) return null;

    switch (progress.status) {
      case 'LOCKED':
        return (
          <span className="badge bg-secondary fs-6">
            <i className="bi bi-lock-fill me-1"></i>
            Verrouillé
          </span>
        );
      case 'UNLOCKED':
        return (
          <span className="badge bg-success fs-6">
            <i className="bi bi-unlock-fill me-1"></i>
            Déverrouillé
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="badge bg-warning text-dark fs-6">
            <i className="bi bi-hourglass-split me-1"></i>
            En cours
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="badge bg-primary fs-6">
            <i className="bi bi-check-circle-fill me-1"></i>
            Complété
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Fil d'Ariane */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/formation">
              <i className="bi bi-mortarboard me-1"></i>
              Formation
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Module {module.order}
          </li>
        </ol>
      </nav>

      {/* En-tête du module */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <div className="mb-2">
                <i className={`bi ${module.icon} fs-3 me-2 text-primary`}></i>
                <span className="badge bg-light text-dark">Module {module.order}</span>
                {getStatusBadge()}
              </div>
              <h1 className="h2 mb-2">{module.title}</h1>
              <p className="text-muted mb-0">{module.description}</p>
            </div>
          </div>

          <div className="d-flex gap-4 text-muted">
            <div>
              <i className="bi bi-clock me-1"></i>
              <small>Durée estimée: {module.durationEstimated} min</small>
            </div>
            {progress?.unlocker && (
              <div>
                <i className="bi bi-unlock me-1"></i>
                <small>
                  Déverrouillé par {
                    progress.unlocker.firstName && progress.unlocker.lastName
                      ? `${progress.unlocker.firstName} ${progress.unlocker.lastName}`
                      : progress.unlocker.email
                  }
                  {progress.unlockedAt && (
                    <span> le {new Date(progress.unlockedAt).toLocaleDateString('fr-FR')}</span>
                  )}
                </small>
              </div>
            )}
            {progress?.completedAt && (
              <div>
                <i className="bi bi-check-circle-fill me-1 text-success"></i>
                <small className="text-success">
                  Complété le {new Date(progress.completedAt).toLocaleDateString('fr-FR')}
                </small>
              </div>
            )}
            {progress?.score !== null && progress?.score !== undefined && (
              <div>
                <i className="bi bi-star-fill me-1 text-warning"></i>
                <small>Score: {progress.score}/100</small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions rapides (sticky top) */}
      {!isAdmin && progress?.status === 'IN_PROGRESS' && (
        <div className="card mb-3 sticky-top" style={{ top: '70px', zIndex: 100 }}>
          <div className="card-body py-3">
            <div className="d-flex justify-content-between align-items-center">
              <Link href="/formation" className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left me-2"></i>
                Retour
              </Link>
              <button
                onClick={handleMarkComplete}
                className="btn btn-success"
                disabled={loading}
              >
                <i className="bi bi-check2-circle me-2"></i>
                {loading ? 'Traitement...' : 'Marquer comme terminé'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenu du module pleine largeur */}
      <div className="row">
        <div className="col-12">
          <div className="card mb-4">
            <div className="card-body p-lg-5">
              <div
                className="module-content"
                dangerouslySetInnerHTML={{ __html: formatContent(module.content) }}
              />
            </div>
          </div>

          {/* Bouton retour en bas */}
          <div className="text-center mb-4">
            <Link href="/formation" className="btn btn-primary btn-lg">
              <i className="bi bi-arrow-left me-2"></i>
              Retour à la liste des modules
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .module-content {
          line-height: 1.8;
          font-size: 1.05rem;
        }

        .module-content h1 {
          font-size: 2rem;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #2c3e50;
          border-bottom: 2px solid #3498db;
          padding-bottom: 0.5rem;
        }

        .module-content h2 {
          font-size: 1.5rem;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          color: #34495e;
        }

        .module-content h3 {
          font-size: 1.25rem;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
          color: #555;
        }

        .module-content p {
          margin-bottom: 1rem;
        }

        .module-content ul,
        .module-content ol {
          margin-bottom: 1rem;
          padding-left: 2rem;
        }

        .module-content li {
          margin-bottom: 0.5rem;
        }

        .module-content strong {
          color: #2c3e50;
          font-weight: 600;
        }

        .module-content em {
          color: #7f8c8d;
        }

        .module-content blockquote {
          border-left: 4px solid #3498db;
          padding-left: 1rem;
          margin-left: 0;
          color: #555;
          font-style: italic;
          background-color: #f8f9fa;
          padding: 1rem;
          border-radius: 4px;
        }

        .module-content code {
          background-color: #f4f4f4;
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
        }

        .module-content pre {
          background-color: #2c3e50;
          color: #ecf0f1;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
        }

        .module-content pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
        }
      `}</style>
    </>
  );
}

// Fonction pour convertir le markdown basique en HTML
function formatContent(content: string): string {
  let html = content;

  // Titres
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Gras
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italique
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Listes non ordonnées
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/, '<ul>$1</ul>');

  // Paragraphes
  html = html.split('\n\n').map(para => {
    if (
      para.startsWith('<h') ||
      para.startsWith('<ul') ||
      para.startsWith('<ol') ||
      para.startsWith('<blockquote')
    ) {
      return para;
    }
    return `<p>${para}</p>`;
  }).join('\n');

  return html;
}
