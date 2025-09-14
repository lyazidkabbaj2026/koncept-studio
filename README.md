# Koncept Studio

Une application de réservation de cours de fitness en français, construite avec Next.js App Router, Supabase, Postgres et shadcn-ui.

## 🏗️ Architecture

L'application suit une séparation stricte des préoccupations :

- **`app/`** : Livraison (UI, routes, actions)
- **`modules/`** : Logique métier (cas d'usage, erreurs, politiques)
- **`infra/`** : Adaptateurs (repos, db, gateways)
- **`lib/`** : Helpers partagés (supabase, config, erreurs)
- **`sql/`** : Schéma et migrations

## 🚀 Étape 1 : Authentification et Navigation

### ✅ Fonctionnalités implémentées

- **Inscription des utilisateurs** : Email, mot de passe, nom complet, téléphone, plan souhaité
- **Authentification** : Connexion et déconnexion
- **Gestion des rôles** : Utilisateurs normaux et administrateurs
- **Protection des routes** : Middleware pour sécuriser `/admin` et `/espace`
- **Navigation adaptée** : Navbar avec liens conditionnels selon le rôle et le statut
- **Bannière de statut** : Notification pour les comptes en attente

### 🎯 Types d'utilisateurs

1. **Visiteurs anonymes**
   - Accès à la page d'accueil/marketing
   - Liens d'inscription et de connexion

2. **Utilisateurs réguliers**
   - Statut "pending" après inscription jusqu'à activation admin
   - Accès à `/espace` avec bannière d'attente si statut pending
   - Accès complet au membre après activation : Planning, Mes réservations, Mon abonnement

3. **Administrateurs**
   - Accès au tableau de bord admin à `/admin`
   - Gestion des utilisateurs et activation des comptes

## ⚙️ Configuration

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase

### Installation

1. **Cloner le projet**
   ```bash
   git clone <repo-url>
   cd koncept-studio
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer Supabase**
   - Créer un nouveau projet sur [supabase.com](https://supabase.com)
   - Copier `.env.example` vers `.env.local`
   - Remplir les variables d'environnement :
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
     ```

4. **Configurer la base de données**
   - Dans le dashboard Supabase, aller dans l'éditeur SQL
   - Exécuter le contenu de `sql/001_create_profiles_table.sql`

### Lancer l'application

```bash
npm run dev
```

L'application sera disponible sur http://localhost:3000

## 🗄️ Base de données

### Table `profiles`

```sql
- id (UUID, PK) - Référence vers auth.users
- email (TEXT, UNIQUE)
- full_name (TEXT)
- phone (TEXT)
- desired_plan (TEXT)
- role (TEXT) - 'user' | 'admin'
- plan_review_status (TEXT) - 'pending' | 'active' | 'inactive'
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Politiques de sécurité (RLS)

- Les utilisateurs peuvent voir et modifier leur propre profil
- Les admins peuvent voir et modifier tous les profils
- Création automatique du profil lors de l'inscription

## 🛣️ Routes

### Publiques
- `/` - Page d'accueil avec liens d'inscription/connexion
- `/login` - Connexion
- `/signup` - Inscription

### Protégées (authentification requise)
- `/espace` - Espace membre avec bannière si statut pending

### Admin uniquement
- `/admin` - Tableau de bord administrateur

## 🔒 Sécurité

- **Middleware de protection** : Redirection automatique selon l'authentification et le rôle
- **Supabase SSR** : Configuration correcte pour Next.js App Router
- **Row Level Security** : Politiques au niveau base de données
- **Cookies sécurisés** : Écriture uniquement dans Server Actions/Route Handlers

## 📋 Prochaines étapes

- [ ] Étape 2 : Gestion des cours et planning
- [ ] Étape 3 : Système de réservation
- [ ] Étape 4 : Gestion des paiements
- [ ] Étape 5 : Notifications et communications

## 🛠️ Technologies

- **Next.js 15** avec App Router
- **Supabase** pour l'authentification et la base de données
- **Postgres** comme base de données
- **Tailwind CSS** pour le styling
- **TypeScript** pour la sécurité des types
- **shadcn-ui** pour les composants UI