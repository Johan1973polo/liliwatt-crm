'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Question {
  index: number;
  question: string;
  type: string;
  options: string[];
}

interface ResultDetail {
  question: string;
  type: string;
  options: string[];
  userAnswer: number;
  correct: number;
  isCorrect: boolean;
  explanation: string;
}

export default function QuizClient({ moduleId }: { moduleId: string }) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleOrder, setModuleOrder] = useState(0);
  const [passMark, setPassMark] = useState(4);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    total: number;
    passed: boolean;
    results: ResultDetail[];
  } | null>(null);

  useEffect(() => {
    fetch(`/api/quiz/${moduleId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setQuestions(data.questions);
        setModuleTitle(data.moduleTitle);
        setModuleOrder(data.moduleOrder);
        setPassMark(data.passMark);
        setAnswers(new Array(data.questions.length).fill(-1));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [moduleId]);

  const handleSelect = (optIndex: number) => {
    if (answered) return;
    setSelected(optIndex);
  };

  const handleConfirm = () => {
    if (selected === null) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = selected;
    setAnswers(newAnswers);
    setAnswered(true);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const finalAnswers = [...answers];
    finalAnswers[currentQ] = selected ?? answers[currentQ];

    const res = await fetch(`/api/quiz/${moduleId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: finalAnswers }),
    });

    if (res.ok) {
      const data = await res.json();
      setResults(data);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3 text-muted">Chargement du quiz...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-exclamation-circle display-1 text-muted"></i>
        <p className="mt-3">Aucun quiz disponible pour ce module.</p>
        <Link href={`/formation/${moduleId}`} className="btn btn-primary">
          Retour au module
        </Link>
      </div>
    );
  }

  // RESULTS SCREEN
  if (results) {
    const { score, total, passed } = results;
    const pct = Math.round((score / total) * 100);
    let emoji = '❌';
    let message = 'Module à revoir — relisez le contenu et réessayez.';
    let color = '#dc2626';
    if (score === total) {
      emoji = '🏆';
      message = 'Excellent ! Module parfaitement maîtrisé !';
      color = '#16a34a';
    } else if (score >= passMark) {
      emoji = '✅';
      message = 'Très bien ! Module validé !';
      color = '#16a34a';
    } else if (score >= 3) {
      emoji = '📚';
      message = 'Bien mais peut mieux faire. Relisez le module.';
      color = '#f97316';
    }

    return (
      <div>
        {/* Result header */}
        <div
          style={{
            background: passed
              ? 'linear-gradient(135deg, #16a34a, #0891b2)'
              : 'linear-gradient(135deg, #dc2626, #9a3412)',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            marginBottom: '24px',
            color: 'white',
          }}
        >
          <div style={{ fontSize: '64px' }}>{emoji}</div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '12px 0 8px', color: 'white' }}>
            {score} / {total}
          </h1>
          <p style={{ fontSize: '16px', opacity: 0.9, margin: 0, color: 'white' }}>{message}</p>
          {passed && (
            <p style={{ marginTop: '12px', fontSize: '13px', opacity: 0.8, color: 'white' }}>
              Le module suivant a été débloqué automatiquement.
            </p>
          )}
        </div>

        {/* Detail per question */}
        {results.results.map((r, i) => (
          <div
            key={i}
            style={{
              background: r.isCorrect ? '#f0fdf4' : '#fef2f2',
              borderLeft: `4px solid ${r.isCorrect ? '#16a34a' : '#dc2626'}`,
              borderRadius: '0 10px 10px 0',
              padding: '14px 20px',
              marginBottom: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '16px' }}>{r.isCorrect ? '✅' : '❌'}</span>
              <strong style={{ fontSize: '13px', color: r.isCorrect ? '#166534' : '#991b1b' }}>
                Question {i + 1} — {r.type}
              </strong>
            </div>
            <p style={{ fontSize: '13px', margin: '0 0 6px', color: '#374151' }}>{r.question}</p>
            <p style={{ fontSize: '12px', margin: '0 0 4px', color: '#6b7280' }}>
              Votre réponse : <strong>{r.options[r.userAnswer] || 'Aucune'}</strong>
            </p>
            {!r.isCorrect && (
              <p style={{ fontSize: '12px', margin: '0 0 4px', color: '#16a34a' }}>
                Bonne réponse : <strong>{r.options[r.correct]}</strong>
              </p>
            )}
            <p style={{ fontSize: '12px', margin: 0, color: '#7c3aed', fontStyle: 'italic' }}>
              {r.explanation}
            </p>
          </div>
        ))}

        {/* Actions */}
        <div className="d-flex gap-3 mt-4">
          {passed ? (
            <Link href="/formation" className="btn btn-primary w-100 py-3" style={{ fontSize: '15px' }}>
              <i className="bi bi-mortarboard me-2"></i>Retour à la formation
            </Link>
          ) : (
            <Link
              href={`/formation/${moduleId}`}
              className="btn w-100 py-3 text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #d946ef)', border: 'none', fontSize: '15px' }}
            >
              <i className="bi bi-book me-2"></i>Relire le module
            </Link>
          )}
        </div>
      </div>
    );
  }

  // QUIZ SCREEN
  const q = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;
  const isLast = currentQ === questions.length - 1;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <p className="text-muted mb-1" style={{ fontSize: '13px' }}>
          Module {moduleOrder} — {moduleTitle}
        </p>
        <h2 style={{ color: '#1e1b4b', fontWeight: 700, fontSize: '20px', margin: '0 0 12px' }}>
          Question {currentQ + 1} sur {questions.length}
        </h2>
        <div style={{ background: '#e9d5ff', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
          <div
            style={{
              background: 'linear-gradient(90deg, #7c3aed, #d946ef)',
              height: '100%',
              width: `${progress}%`,
              borderRadius: '10px',
              transition: 'width 0.3s',
            }}
          />
        </div>
      </div>

      {/* Question card */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e9d5ff',
          borderRadius: '14px',
          padding: '24px',
          marginBottom: '20px',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            background: '#f5f3ff',
            color: '#7c3aed',
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '12px',
            marginBottom: '12px',
          }}
        >
          Question {currentQ + 1} — {q.type}
        </span>

        <p style={{ fontSize: '15px', fontWeight: 600, color: '#1e1b4b', lineHeight: 1.6, margin: '0 0 16px' }}>
          {q.question}
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {q.options.map((opt, i) => {
            let bg = 'white';
            let border = '2px solid #e9d5ff';
            let textColor = '#374151';

            if (answered && results === null) {
              // We don't know correct answer yet on client, show selected
              if (i === selected) {
                bg = '#f5f3ff';
                border = '2px solid #7c3aed';
                textColor = '#4c1d95';
              }
            } else if (selected === i) {
              bg = '#f5f3ff';
              border = '2px solid #7c3aed';
              textColor = '#4c1d95';
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={answered}
                style={{
                  background: bg,
                  border,
                  borderRadius: '10px',
                  padding: '12px 16px',
                  textAlign: 'left',
                  cursor: answered ? 'default' : 'pointer',
                  fontSize: '14px',
                  color: textColor,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!answered) {
                    (e.target as HTMLButtonElement).style.borderColor = '#7c3aed';
                    (e.target as HTMLButtonElement).style.background = '#f5f3ff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!answered && selected !== i) {
                    (e.target as HTMLButtonElement).style.borderColor = '#e9d5ff';
                    (e.target as HTMLButtonElement).style.background = 'white';
                  }
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: selected === i ? '#7c3aed' : '#e9d5ff',
                    color: selected === i ? 'white' : '#7c3aed',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginRight: '10px',
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="d-flex gap-3">
        {!answered ? (
          <button
            className="btn w-100 py-3 text-white"
            style={{
              background: selected !== null ? 'linear-gradient(135deg, #7c3aed, #d946ef)' : '#d1d5db',
              border: 'none',
              fontSize: '15px',
            }}
            disabled={selected === null}
            onClick={handleConfirm}
          >
            Valider ma réponse
          </button>
        ) : isLast ? (
          <button
            className="btn w-100 py-3 text-white"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #d946ef)', border: 'none', fontSize: '15px' }}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : (
              <i className="bi bi-check-circle me-2"></i>
            )}
            Terminer le quiz
          </button>
        ) : (
          <button
            className="btn w-100 py-3 text-white"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', fontSize: '15px' }}
            onClick={handleNext}
          >
            Question suivante <i className="bi bi-arrow-right ms-2"></i>
          </button>
        )}
      </div>
    </div>
  );
}
