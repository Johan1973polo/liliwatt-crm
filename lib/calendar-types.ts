// Types d'événements pour le calendrier
export const EVENT_TYPES = {
  RDV_CLIENT: 'RDV_CLIENT',
  RAPPEL_CLIENT: 'RAPPEL_CLIENT',
  RAPPEL_CLIENT_CHAUD: 'RAPPEL_CLIENT_CHAUD',
  INDISPONIBLE: 'INDISPONIBLE',
  NE_TRAVAILLE_PAS: 'NE_TRAVAILLE_PAS',
  FORMATION: 'FORMATION',
  RECRUTEMENT: 'RECRUTEMENT',
  AUTRE: 'AUTRE',
} as const;

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];

// Configuration des types d'événements avec couleurs et labels
export const EVENT_TYPE_CONFIG = {
  [EVENT_TYPES.RDV_CLIENT]: {
    label: 'Rendez-vous client',
    color: '#3b82f6', // Bleu
    icon: 'bi-person-check',
    roles: ['VENDEUR', 'REFERENT', 'ADMIN'],
  },
  [EVENT_TYPES.RAPPEL_CLIENT]: {
    label: 'Rappel client',
    color: '#06b6d4', // Cyan
    icon: 'bi-telephone',
    roles: ['VENDEUR', 'REFERENT', 'ADMIN'],
  },
  [EVENT_TYPES.RAPPEL_CLIENT_CHAUD]: {
    label: 'Rappel client chaud',
    color: '#ef4444', // Rouge
    icon: 'bi-telephone-fill',
    roles: ['VENDEUR', 'REFERENT', 'ADMIN'],
  },
  [EVENT_TYPES.INDISPONIBLE]: {
    label: 'Indisponible',
    color: '#f59e0b', // Orange
    icon: 'bi-exclamation-circle',
    roles: ['VENDEUR', 'REFERENT', 'ADMIN'],
  },
  [EVENT_TYPES.NE_TRAVAILLE_PAS]: {
    label: 'Ne travaille pas',
    color: '#6b7280', // Gris
    icon: 'bi-calendar-x',
    roles: ['VENDEUR', 'REFERENT', 'ADMIN'],
  },
  [EVENT_TYPES.FORMATION]: {
    label: 'Formation',
    color: '#10b981', // Vert
    icon: 'bi-book',
    roles: ['VENDEUR', 'REFERENT', 'ADMIN'],
  },
  [EVENT_TYPES.RECRUTEMENT]: {
    label: 'Recrutement',
    color: '#8b5cf6', // Violet
    icon: 'bi-people',
    roles: ['REFERENT', 'ADMIN'],
  },
  [EVENT_TYPES.AUTRE]: {
    label: 'Autre',
    color: '#3b82f6', // Bleu par défaut
    icon: 'bi-calendar-event',
    roles: ['VENDEUR', 'REFERENT', 'ADMIN'],
  },
};

// Fonction pour obtenir les types d'événements disponibles selon le rôle
export function getAvailableEventTypes(role: string): EventType[] {
  return Object.entries(EVENT_TYPE_CONFIG)
    .filter(([_, config]) => config.roles.includes(role))
    .map(([type]) => type as EventType);
}
