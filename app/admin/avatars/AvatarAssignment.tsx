'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface User {
  id: string;
  email: string;
  role: string;
  avatar: string | null;
}

interface AvatarAssignmentProps {
  users: User[];
  availableAvatars: string[];
}

export default function AvatarAssignment({ users, availableAvatars }: AvatarAssignmentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleAssignAvatar = async (userId: string, avatarPath: string) => {
    setLoading(userId);

    try {
      const response = await fetch(`/api/admin/users/${userId}/avatar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: avatarPath }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert('Erreur lors de l\'attribution de l\'avatar');
      }
    } catch (error) {
      alert('Erreur lors de l\'attribution de l\'avatar');
    } finally {
      setLoading(null);
    }
  };

  const handleRemoveAvatar = async (userId: string) => {
    setLoading(userId);

    try {
      const response = await fetch(`/api/admin/users/${userId}/avatar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: null }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert('Erreur lors de la suppression de l\'avatar');
      }
    } catch (error) {
      alert('Erreur lors de la suppression de l\'avatar');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="row">
      {users.map((user) => (
        <div key={user.id} className="col-md-6 col-lg-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.email}
                    width={64}
                    height={64}
                    className="rounded-circle me-3"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center me-3"
                    style={{ width: '64px', height: '64px' }}
                  >
                    <i className="bi bi-person-fill text-white" style={{ fontSize: '2rem' }}></i>
                  </div>
                )}
                <div className="flex-grow-1">
                  <h6 className="mb-1">{user.email}</h6>
                  <span className={`badge ${user.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`}>
                    {user.role === 'ADMIN' ? 'Administrateur' : 'Référent'}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Choisir un avatar :</label>
                <div className="row g-2">
                  {availableAvatars.map((avatar) => {
                    const avatarName = avatar.split('/').pop()?.replace('.png', '');
                    const isSelected = user.avatar === avatar;

                    return (
                      <div key={avatar} className="col-4">
                        <button
                          onClick={() => handleAssignAvatar(user.id, avatar)}
                          disabled={loading === user.id}
                          className={`btn w-100 p-2 ${
                            isSelected ? 'btn-primary' : 'btn-outline-secondary'
                          }`}
                          style={{ position: 'relative' }}
                        >
                          <Image
                            src={avatar}
                            alt={avatarName || 'Avatar'}
                            width={60}
                            height={60}
                            className="rounded-circle"
                            style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
                          />
                          <small className="d-block mt-1 text-truncate">{avatarName}</small>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {user.avatar && (
                <button
                  onClick={() => handleRemoveAvatar(user.id)}
                  disabled={loading === user.id}
                  className="btn btn-sm btn-outline-danger w-100"
                >
                  <i className="bi bi-trash me-1"></i>
                  Retirer l&apos;avatar
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
