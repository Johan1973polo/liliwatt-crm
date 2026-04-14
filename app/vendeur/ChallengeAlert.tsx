'use client';

interface ChallengeAlertProps {
  challenge: {
    message: string;
  } | null;
}

export default function ChallengeAlert({ challenge }: ChallengeAlertProps) {
  if (!challenge) return null;

  return (
    <div className="alert alert-warning border-3 border-warning shadow-lg mb-4 animate__animated animate__pulse animate__infinite" style={{ animation: 'pulse 2s infinite' }}>
      <div className="d-flex align-items-center">
        <div className="me-3">
          <i className="bi bi-trophy-fill text-warning" style={{ fontSize: '3rem' }}></i>
        </div>
        <div className="flex-grow-1">
          <h4 className="alert-heading mb-2">
            <i className="bi bi-megaphone-fill me-2"></i>
            🏆 CHALLENGE DU JOUR 🏆
          </h4>
          <h5 className="fw-bold mb-0" style={{ fontSize: '1.5rem', lineHeight: '1.4' }}>
            {challenge.message}
          </h5>
        </div>
      </div>
    </div>
  );
}
