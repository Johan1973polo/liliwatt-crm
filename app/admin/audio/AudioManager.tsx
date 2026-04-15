'use client';

import { useState, useEffect, useRef } from 'react';

interface AudioItem {
  id: string;
  title: string;
  category: string;
  description: string | null;
  driveFileId: string;
  driveUrl: string;
  duration: number | null;
  createdAt: string;
  uploader?: { firstName: string | null; lastName: string | null; email: string };
}

export default function AudioManager() {
  const [audios, setAudios] = useState<AudioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('PROSPECTION');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadAudios = async () => {
    const r = await fetch('/api/admin/audio');
    if (r.ok) setAudios(await r.json());
    setLoading(false);
  };

  useEffect(() => { loadAudios(); }, []);

  const handleUpload = async () => {
    if (!title.trim() || !file) return;
    setUploading(true);
    setUploadProgress(0);

    try {
      // Étape 1 : préparer l'upload (serveur → Drive resumable URL)
      const prepRes = await fetch('/api/admin/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          description: description.trim() || null,
          filename: file.name,
          mimeType: file.type || 'audio/mpeg',
          fileSize: file.size,
        }),
      });

      if (!prepRes.ok) {
        const d = await prepRes.json();
        throw new Error(d.error || 'Erreur préparation');
      }

      const { audioId, uploadUrl } = await prepRes.json();
      setUploadProgress(10);

      // Étape 2 : upload direct navigateur → Google Drive
      const uploadRes = await new Promise<Response>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl, true);
        xhr.setRequestHeader('Content-Type', file.type || 'audio/mpeg');

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(10 + Math.round((e.loaded / e.total) * 80));
          }
        };

        xhr.onload = () => {
          resolve(new Response(xhr.responseText, { status: xhr.status }));
        };
        xhr.onerror = () => reject(new Error('Upload réseau échoué'));

        xhr.send(file);
      });

      if (uploadRes.status < 200 || uploadRes.status >= 300) {
        throw new Error('Upload Drive échoué: ' + uploadRes.status);
      }

      // Extraire le fileId de la réponse Drive
      const driveData = JSON.parse(await uploadRes.text());
      const driveFileId = driveData.id;
      setUploadProgress(90);

      // Étape 3 : confirmer (serveur met à jour Prisma + permissions)
      const confirmRes = await fetch(`/api/admin/audio/${audioId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driveFileId }),
      });

      if (!confirmRes.ok) throw new Error('Erreur confirmation');

      setUploadProgress(100);
      setTitle('');
      setDescription('');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      loadAudios();
    } catch (e: any) {
      alert('Erreur: ' + e.message);
    }

    setUploading(false);
    setUploadProgress(0);
  };

  const handleDelete = async (id: string, audioTitle: string) => {
    if (!confirm(`Supprimer "${audioTitle}" ?`)) return;
    await fetch(`/api/admin/audio/${id}`, { method: 'DELETE' });
    loadAudios();
  };

  const prospection = audios.filter(a => a.category === 'PROSPECTION');
  const closing = audios.filter(a => a.category === 'CLOSING');

  return (
    <div>
      {/* Upload zone */}
      <div className="card mb-4">
        <div className="card-body">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault(); setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f && (f.type.startsWith('audio/') || f.name.match(/\.(mp3|wav|m4a|ogg)$/i))) setFile(f);
            }}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? '#7c3aed' : '#d8b4fe'}`,
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragOver ? '#f5f3ff' : '#faf5ff',
              transition: 'all .2s',
              marginBottom: '16px',
            }}
          >
            {file ? (
              <p style={{ color: '#7c3aed', fontWeight: 700, margin: 0 }}>
                <i className="bi bi-file-music me-2"></i>{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
              </p>
            ) : (
              <>
                <p style={{ color: '#7c3aed', fontWeight: 700, fontSize: '16px', margin: '0 0 6px' }}>
                  <i className="bi bi-mic me-2"></i>Glissez votre fichier audio ici
                </p>
                <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>MP3, WAV, M4A — max 50 MB</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="audio/*,.mp3,.wav,.m4a,.ogg" style={{ display: 'none' }}
            onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />

          <div className="row g-3 mb-3">
            <div className="col-md-5">
              <input type="text" className="form-control" placeholder="Ex: Accroche réussie - prospect boulangerie"
                value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="col-md-3">
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="PROSPECTION">📞 Phase Prospection</option>
                <option value="CLOSING">🤝 Phase Closing R2</option>
              </select>
            </div>
            <div className="col-md-4">
              <input type="text" className="form-control" placeholder="Description (optionnel)"
                value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>

          {/* Progress bar */}
          {uploading && (
            <div className="mb-3">
              <div style={{ background: '#e9d5ff', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                <div style={{
                  background: 'linear-gradient(90deg, #7c3aed, #d946ef)',
                  height: '100%',
                  width: `${uploadProgress}%`,
                  borderRadius: '10px',
                  transition: 'width 0.3s',
                }} />
              </div>
              <small className="text-muted mt-1 d-block text-center">
                {uploadProgress < 10 ? 'Préparation...' :
                 uploadProgress < 90 ? `Upload direct vers Drive... ${uploadProgress}%` :
                 uploadProgress < 100 ? 'Finalisation...' : 'Terminé !'}
              </small>
            </div>
          )}

          <button
            className="btn text-white w-100 py-2"
            style={{ background: '#7c3aed', border: 'none', fontWeight: 600 }}
            onClick={handleUpload}
            disabled={uploading || !title.trim() || !file}
          >
            {uploading ? <><span className="spinner-border spinner-border-sm me-2"></span>Upload en cours...</> : '💾 Ajouter cet audio'}
          </button>
        </div>
      </div>

      {/* Lists */}
      {loading ? (
        <div className="text-center py-4"><div className="spinner-border text-primary"></div></div>
      ) : (
        <>
          <AudioSection title="📞 Phase Prospection" items={prospection} onDelete={handleDelete} color="#7c3aed" />
          <AudioSection title="🤝 Phase Closing R2" items={closing} onDelete={handleDelete} color="#d946ef" />
        </>
      )}
    </div>
  );
}

function AudioSection({ title, items, onDelete, color }: {
  title: string; items: AudioItem[]; onDelete: (id: string, title: string) => void; color: string;
}) {
  return (
    <div className="mb-4">
      <h5 style={{ color: '#1e1b4b', fontWeight: 600, borderLeft: `4px solid ${color}`, paddingLeft: '12px' }}>{title}</h5>
      {items.length === 0 ? (
        <div className="text-center py-4 text-muted" style={{ fontSize: '13px' }}>
          Aucun audio pour le moment — ajoutez votre premier exemple !
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {items.map((a) => (
            <div key={a.id} className="card" style={{ border: `0.5px solid ${color}30` }}>
              <div className="card-body py-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: '#1e1b4b', fontSize: '14px' }}>
                      <i className="bi bi-mic me-1" style={{ color }}></i>{a.title}
                    </strong>
                    {a.description && <p className="text-muted mb-1" style={{ fontSize: '12px' }}>{a.description}</p>}
                    {a.driveFileId && a.driveFileId !== 'PENDING' && (
                      <audio
                        controls
                        src={`https://drive.google.com/uc?export=download&id=${a.driveFileId}`}
                        style={{ width: '100%', height: '36px', marginTop: '6px' }}
                        preload="none"
                      />
                    )}
                    <small className="text-muted">Ajouté le {new Date(a.createdAt).toLocaleDateString('fr-FR')}</small>
                  </div>
                  <button
                    className="btn btn-sm ms-2"
                    style={{ background: '#fef2f2', color: '#dc2626', border: 'none' }}
                    onClick={() => onDelete(a.id, a.title)}
                    title="Supprimer"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
