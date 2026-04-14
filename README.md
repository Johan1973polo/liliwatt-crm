# CRM Télévendeur - Ecogies

Mini-CRM pour la gestion des télévendeurs avec système de rôles (ADMIN / REFERENT / VENDEUR).

## Fonctionnalités

### ADMIN
- Gestion complète des vendeurs et référents (CRUD)
- Création et gestion des liens globaux
- Visualisation de toutes les demandes et messages
- Système de notifications

### REFERENT
- Gestion de ses vendeurs (CRUD)
- Création de liens d'équipe
- Réception des demandes et messages de ses vendeurs
- Visualisation des disponibilités

### VENDEUR
- Accès à ses identifiants et mots de passe (chiffrés)
- Accès aux liens (globaux + équipe + personnels)
- Envoi de messages au référent
- Création de demandes (base télépro, note financière)
- Déclaration de disponibilités OMBA

## Sécurité

- Authentification via NextAuth (Credentials)
- Mots de passe hashés avec bcrypt
- Identifiants des services chiffrés avec AES-256-GCM
- RBAC strict (vérification des permissions à chaque route)
- Mots de passe masqués par défaut (bouton 👁️ pour révéler avec confirmation)

## Stack Technique

- **Framework**: Next.js 14 (App Router) + TypeScript
- **UI**: Bootstrap 5 + Bootstrap Icons
- **Base de données**: SQLite + Prisma ORM
- **Authentification**: NextAuth v4
- **Chiffrement**: Node.js Crypto (AES-256-GCM)

## Installation

### Prérequis

- Node.js 18+ et npm
- macOS, Linux ou Windows

### Étapes d'installation

1. **Ouvrir le terminal dans le dossier du projet**
   ```bash
   cd ~/Desktop/"CRM télévendeur"
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**

   Le fichier `.env` est déjà créé avec des valeurs par défaut. Si vous voulez le personnaliser :

   ```bash
   # Copier l'exemple (optionnel)
   cp .env.example .env
   ```

   Puis éditer `.env` :
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="votre-secret-unique-32-caracteres-minimum"
   ENCRYPTION_KEY="votre-cle-de-chiffrement-32-car"
   ```

   **IMPORTANT**: `ENCRYPTION_KEY` doit faire exactement 32 caractères pour AES-256.

4. **Générer le client Prisma**
   ```bash
   npm run prisma:generate
   ```

5. **Créer la base de données et appliquer les migrations**
   ```bash
   npm run prisma:migrate
   ```

6. **Alimenter la base avec les données de test**
   ```bash
   npm run prisma:seed
   ```

## Lancement du projet

### Mode développement

```bash
npm run dev
```

Le site sera accessible à : [http://localhost:3000](http://localhost:3000)

### Mode production

```bash
npm run build
npm run start
```

## Comptes de test

Après avoir exécuté le seed, vous pouvez vous connecter avec :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | admin@ecogies.fr | Admin123! |
| **Référent** | referent@ecogies.fr | Referent123! |
| **Vendeur** | vendeur@ecogies.fr | Vendeur123! |

## Structure du projet

```
CRM télévendeur/
├── app/
│   ├── admin/              # Pages admin (liste vendeurs, notifications)
│   ├── referent/           # Pages référent (mes vendeurs, notifications)
│   ├── vendeur/            # Dashboard vendeur
│   ├── auth/               # Page de connexion
│   ├── api/                # Routes API (vendors, messages, requests, etc.)
│   ├── layout.tsx          # Layout global
│   ├── page.tsx            # Page d'accueil (redirection)
│   └── globals.css         # Styles globaux + palette
├── components/             # Composants réutilisables
│   ├── Navbar.tsx
│   ├── VendorCard.tsx
│   └── SessionProvider.tsx
├── lib/
│   ├── auth.ts            # Configuration NextAuth
│   ├── prisma.ts          # Client Prisma
│   └── crypto.ts          # Utilitaires de chiffrement
├── prisma/
│   ├── schema.prisma      # Schéma de la base de données
│   ├── seed.ts            # Script de seed
│   └── migrations/        # Migrations Prisma
├── types/
│   └── next-auth.d.ts     # Types TypeScript pour NextAuth
├── .env                   # Variables d'environnement
├── .env.example           # Exemple de configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts disponibles

```bash
# Développement
npm run dev                 # Lancer le serveur de développement

# Build
npm run build              # Construire pour la production
npm run start              # Lancer en production

# Prisma
npm run prisma:generate    # Générer le client Prisma
npm run prisma:migrate     # Créer/appliquer les migrations
npm run prisma:seed        # Alimenter la base de données
npm run prisma:studio      # Ouvrir Prisma Studio (GUI)

# Tout en un
npm run setup              # Install + generate + migrate + seed
```

## Base de données (Prisma)

### Modèles principaux

- **User**: Utilisateurs (Admin, Référent, Vendeur)
- **Credential**: Identifiants de services (chiffrés)
- **Link**: Liens/boutons (Global, Team, User)
- **Request**: Demandes (base télépro, note financière)
- **Message**: Messages entre utilisateurs
- **Availability**: Disponibilités OMBA
- **Notification**: Notifications (demandes, messages)

### Visualiser la base de données

```bash
npm run prisma:studio
```

Ouvre une interface web à [http://localhost:5555](http://localhost:5555) pour explorer les données.

## Palette de couleurs

Le design respecte la palette suivante :

- **Background global**: `#F6F8FC`
- **Cartes**: `#FFFFFF`
- **Bordures**: `#E6EAF2`
- **Texte principal**: `#0B1B3A` (bleu nuit)
- **Texte secondaire**: `#64748B`
- **Primary (vert)**: `#16A34A`
- **Info (bleu)**: `#2563EB`
- **Danger (rouge)**: `#EF4444`

## Permissions et sécurité

### RBAC (Role-Based Access Control)

Chaque route API vérifie :
1. L'authentification (session NextAuth)
2. Le rôle de l'utilisateur
3. Les permissions spécifiques (ex: un référent ne peut gérer que SES vendeurs)

### Chiffrement des mots de passe

- Les mots de passe des utilisateurs sont hashés avec **bcrypt**
- Les mots de passe des services sont chiffrés avec **AES-256-GCM**
- La révélation d'un mot de passe nécessite une confirmation

## Ajout de nouveaux services/liens

### Liens globaux (Admin uniquement)

Ajouter directement dans le seed ou via Prisma Studio :
```typescript
await prisma.link.create({
  data: {
    scope: 'GLOBAL',
    title: 'Nouveau Service',
    url: 'https://exemple.com',
    order: 5,
  },
});
```

### Identifiants pour un vendeur

Via l'interface d'édition vendeur ou l'API :
```typescript
await prisma.credential.create({
  data: {
    userId: 'vendor-id',
    serviceName: 'Nouveau Service',
    login: 'identifiant',
    passwordEncrypted: encryptPassword('mot-de-passe'),
  },
});
```

## Développement futur

Fonctionnalités possibles :
- Export des données (Excel, PDF)
- Tableaux de bord analytiques
- Système de tâches/rappels
- Calendrier partagé d'équipe
- Historique des modifications
- Recherche avancée
- Filtres personnalisés
- Mode sombre

## Support

Pour toute question ou problème :
1. Vérifier que toutes les dépendances sont installées
2. Vérifier que le fichier `.env` est correctement configuré
3. Vérifier que la base de données est créée (`prisma migrate`)
4. Consulter les logs du serveur de développement

## Licence

Projet interne Ecogies - Tous droits réservés

---

**Développé avec Next.js 14, TypeScript, Prisma et Bootstrap 5**
