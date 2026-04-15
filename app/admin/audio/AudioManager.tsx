'use client';

import { useState, useEffect, useRef } from 'react';
import { upload } from '@vercel/blob/client';

interface AudioItem {
  id: string;
  title: string;
  category: string;
  description: string | null;
  driveUrl: string;
  createdAt: string;
}

export default function AudioManager() {
  const [audios, setAudios] = useState<AudioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('PROSPECTION');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchAudios = async () => {
    const r = await fetch('/api/admin/audio');
    if (r.ok) setAudios(await r.json());
    setLoading(false);
  };

  useEffect(() => { fetchAudios(); }, []);

  const handleUpload = async () => {
    if (!title.trim() || !file) return;
    setUploading(true);

    try {
      // Étape 1 : upload direct navigateur → Vercel Blob (bypass 4.5MB)
      const blob = await upload(
        `audios/${Date.now()}-${file.name.replace(/\s/g, '-')}`,
        file,
        {
          access: 'public',
          handleUploadUrl: '/api/admin/audio',
        }
      );

      // Étape 2 : sauvegarder les métadonnées en base
      await fetch('/api/admin/audio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          description: description.trim(),
          blobUrl: blob.url,
          blobPathname: blob.pathname,
        }),
      });

      setTitle(''); setDescription(''); setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      fetchAudios();
    } catch (e: any) {
      alert('Erreur: ' + e.message);
    }

    setUploading(false);
  };

  const handleDelete = async (id: string, audioTitle: string) => {
    if (!confirm(`Supprimer "${audioTitle}" ?`)) return;
    await fetch(`/api/admin/audio/${id}`, { method: 'DELETE' });
    fetchAudios();
  };

  const prospection = audios.filter(a => a.category === 'PROSPECTION');
  const closing = audios.filter(a => a.category === 'CLOSING');

  return (
    <div>
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
              borderRadius: '12px', padding: '32px', textAlign: 'center',
              cursor: 'pointer', background: dragOver ? '#f5f3ff' : '#faf5ff',
              transition: 'all .2s', marginBottom: '16px',
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
                <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>MP3, WAV, M4A — max 100 MB</p>
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
                    <audio controls src={a.driveUrl} style={{ width: '100%', height: '36px', marginTop: '6px' }} preload="none" />
                    <small className="text-muted">Ajouté le {new Date(a.createdAt).toLocaleDateString('fr-FR')}</small>
                  </div>
                  <button className="btn btn-sm ms-2" style={{ background: '#fef2f2', color: '#dc2626', border: 'none' }}
                    onClick={() => onDelete(a.id, a.title)} title="Supprimer">
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
