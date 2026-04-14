'use client';

import { useState } from 'react';

export default function AITestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInitCourtiers = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ai/init-courtiers', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur lors de l&apos;initialisation');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessEvents = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ai/process-events', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur lors du traitement');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Créer un challenge de test
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Challenge du jour : Qui fera 5 ventes avant 17h ? 🏆',
          isActive: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur lors de la création du challenge');
      } else {
        setResult({ success: true, message: 'Challenge créé ! Lancez le traitement pour voir les réactions IA.', challenge: data });
      }
    } catch (err) {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSale = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Créer une vente de test
      const response = await fetch('/api/team-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SALE',
          message: 'Vente réussie : contrat dual 150€/mois 🎉',
          courtierNumber: 15, // Courtier réel qui recevra les félicitations
          isFictional: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur lors de la création de la vente');
      } else {
        setResult({ success: true, message: 'Vente créée ! Lancez le traitement pour voir les félicitations IA.', sale: data });
      }
    } catch (err) {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Test du système d&apos;IA</h1>

      <div className="space-y-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">1. Initialiser les courtiers fictifs</h2>
          <p className="text-gray-600 mb-4">
            Crée 30 courtiers fictifs avec leurs profils, personnalités et affinités.
          </p>
          <button
            onClick={handleInitCourtiers}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Chargement...' : 'Initialiser les courtiers'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">2. Créer des événements de test</h2>
          <p className="text-gray-600 mb-4">
            Crée des événements pour tester les réactions des IA.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleCreateChallenge}
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer un challenge'}
            </button>
            <button
              onClick={handleCreateSale}
              disabled={loading}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer une vente'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">3. Traiter les événements IA</h2>
          <p className="text-gray-600 mb-4">
            Déclenche le traitement automatique : anniversaires, challenges, ventes, messages d&apos;ambiance.
          </p>
          <button
            onClick={handleProcessEvents}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Traitement en cours...' : 'Traiter les événements'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-semibold">Erreur</p>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Résultat</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded">
        <h3 className="font-semibold text-yellow-800 mb-2">Note</h3>
        <p className="text-yellow-700">
          Le CRON job Vercel s&apos;exécute automatiquement chaque jour à 9h00.
          Cette page permet de tester manuellement le système.
        </p>
      </div>
    </div>
  );
}
