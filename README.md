# MedContent Platform

**Une plateforme complète de gestion de contenu médical avec versionnement et traçabilité**

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture technique](#architecture-technique)
- [Caractéristiques principales](#caractéristiques-principales)
- [Installation et configuration](#installation-et-configuration)
- [Structure du projet](#structure-du-projet)
- [Modèles de données](#modèles-de-données)
- [API GraphQL](#api-graphql)
- [Utilisation du frontend](#utilisation-du-frontend)
- [Développement](#développement)
- [Déploiement](#déploiement)
- [Dépannage](#dépannage)

## Vue d'ensemble

MedContent Platform est une application web complète conçue pour la création, la gestion et la publication de contenu médical. Elle offre un système de versionnement robuste, une traçabilité complète des modifications, et une gestion fine des accès basée sur les rôles utilisateurs.

Cette plateforme répond aux besoins spécifiques des organisations médicales nécessitant un contrôle strict sur la qualité et l'historique de leur contenu, tout en facilitant la collaboration entre différents intervenants (auteurs, éditeurs, relecteurs).

## Architecture technique

### Stack Backend
- **NestJS** : Framework Node.js pour le développement d'API
- **GraphQL** : Langage de requête pour l'API
- **Prisma** : ORM pour interagir avec la base de données
- **PostgreSQL** : Base de données relationnelle
- **JWT** : Authentification basée sur les tokens

### Stack Frontend
- **Next.js** : Framework React avec rendu serveur
- **TypeScript** : Typage statique pour JavaScript
- **Apollo Client** : Client GraphQL pour React
- **NextAuth.js** : Authentification et gestion de session
- **React Hook Form + Yup** : Gestion et validation des formulaires
- **Tailwind CSS** : Framework CSS utilitaire

## Caractéristiques principales

### Gestion de contenu
- Création et édition d'articles avec un éditeur riche
- Catégorisation flexible du contenu
- Système de statuts (brouillon, en révision, publié, archivé)
- Attachement de fichiers aux versions d'articles

### Versionnement
- Conservation de l'historique complet des modifications
- Comparaison entre versions
- Restauration à des versions antérieures
- Métadonnées pour chaque version (auteur, date, motif)

### Contrôle d'accès
- Système de rôles utilisateurs (ADMIN, EDITOR, REVIEWER, READER)
- Permissions basées sur les rôles
- Authentification sécurisée avec JWT

### Traçabilité
- Journal des modifications détaillé (changelog)
- Enregistrement de toutes les opérations (création, modification, suppression)
- Documentation des motifs de modification

## Installation et configuration

### Prérequis
- Node.js (v16+)
- PostgreSQL (v13+)
- npm ou yarn

### Installation

1. Cloner le dépôt
   ```bash
   git clone https://votre-depot/medcontent-platform.git
   cd medcontent-platform
   ```

2. Installer les dépendances
   ```bash
   npm install
   ```

3. Configurer les variables d'environnement
   ```bash
   # Créer un fichier .env à la racine du projet backend
   cp backend/.env.example backend/.env
   # Éditer le fichier .env avec vos paramètres
   ```

   Variables d'environnement essentielles :
   ```
   # Backend .env
   DATABASE_URL="postgresql://user:password@localhost:5432/medcontent?schema=public"
   JWT_SECRET="votre-secret-jwt"
   
   # Frontend .env.local
   NEXT_PUBLIC_API_URL=http://localhost:3001/graphql
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=votre-secret-nextauth
   ```

4. Initialiser la base de données
   ```bash
   npm run db:migrate
   ```

### Démarrage de l'application

1. Démarrer l'application en mode développement
   ```bash
   npm run dev
   ```
   
   Cela lancera simultanément le backend sur `http://localhost:3001` et le frontend sur `http://localhost:3000`.

2. Accéder à Prisma Studio pour explorer la base de données
   ```bash
   npm run db:studio
   ```

## Structure du projet

```
medcontent-platform/
├── backend/                # API backend NestJS
│   ├── prisma/             # Modèles Prisma et migrations
│   ├── src/                # Code source du backend
│   │   ├── app.module.ts   # Module principal NestJS
│   │   ├── articles/       # Module de gestion des articles
│   │   ├── auth/           # Module d'authentification
│   │   ├── categories/     # Module de gestion des catégories
│   │   ├── changelog/      # Module de journal des modifications
│   │   ├── prisma/         # Service Prisma
│   │   ├── users/          # Module de gestion des utilisateurs
│   │   └── main.ts         # Point d'entrée de l'application
│   └── package.json        # Dépendances backend
│
├── frontend/               # Application frontend Next.js
│   ├── src/
│   │   ├── app/            # Routes de l'application (App Router)
│   │   ├── components/     # Composants réutilisables
│   │   │   ├── forms/      # Composants de formulaires
│   │   │   ├── layouts/    # Composants de mise en page
│   │   │   └── ui/         # Composants d'interface
│   │   ├── graphql/        # Requêtes et mutations GraphQL
│   │   ├── lib/            # Utilitaires et configurations
│   │   └── types/          # Types TypeScript
│   └── package.json        # Dépendances frontend
│
└── package.json            # Scripts pour le projet global
```

## Modèles de données

Le schéma de données se compose des entités principales suivantes :

### Utilisateur (User)
- Compte utilisateur avec rôle et informations de base
- Rôles disponibles : ADMIN, EDITOR, REVIEWER, READER

### Article (Article)
- Contenu principal avec métadonnées
- États possibles : DRAFT, UNDER_REVIEW, PUBLISHED, ARCHIVED
- Relation avec versions, catégories et commentaires

### Version d'article (ArticleVersion)
- Instantané du contenu d'un article à un moment donné
- Stocke le contenu, métadonnées et pièces jointes
- Conservation de l'historique complet

### Catégorie (Category)
- Classification des articles par thématique
- Permet l'organisation et la navigation du contenu

### Commentaire (Comment)
- Annotations sur les articles
- Permet la discussion et les retours sur le contenu

### Pièce jointe (Attachment)
- Fichiers associés à une version d'article
- Stockage des métadonnées du fichier et de son URL

### Journal des modifications (ChangeLog)
- Enregistrement des opérations effectuées
- Stockage des détails des modifications et motifs

## API GraphQL

L'API expose des requêtes et mutations GraphQL pour interagir avec les données.

### Principales requêtes
- `me` : Récupérer le profil de l'utilisateur connecté
- `users` : Récupérer la liste des utilisateurs
- `articles` : Récupérer des articles avec filtrage et pagination
- `article` : Récupérer un article spécifique
- `articleVersions` : Récupérer l'historique des versions d'un article
- `categories` : Récupérer les catégories disponibles
- `changeLogs` : Récupérer le journal des modifications

### Principales mutations
- `login` : S'authentifier et recevoir un token
- `signup` : Créer un nouveau compte utilisateur
- `createArticle` : Créer un nouvel article
- `updateArticle` : Mettre à jour un article existant
- `deleteArticle` : Supprimer un article
- `restoreArticleVersion` : Restaurer une version précédente d'un article
- `addAttachment` : Ajouter une pièce jointe à une version d'article

Exemple de requête GraphQL :
```graphql
query GetArticles($status: String, $searchTerm: String) {
  articles(status: $status, searchTerm: $searchTerm) {
    id
    title
    status
    author {
      name
    }
    categories {
      name
    }
    updatedAt
  }
}
```

## Utilisation du frontend

### Navigation principale

Le frontend offre une interface intuitive avec une navigation principale comprenant :

- **Tableau de bord** : Vue d'ensemble avec statistiques et contenu récent
- **Articles** : Gestion complète des articles (création, édition, visualisation)
- **Catégories** : Organisation et navigation du contenu
- **Journal des modifications** : Traçabilité des changements
- **Utilisateurs** : Gestion des comptes utilisateurs (administrateurs uniquement)

### Flux de travail typique

1. **Connexion** : Authentification avec email et mot de passe
2. **Création d'article** : Rédaction d'un nouvel article avec statut brouillon
3. **Édition et catégorisation** : Ajout de contenu et association à des catégories
4. **Soumission pour révision** : Changement de statut pour révision
5. **Révision et approbation** : Examen et validation par les relecteurs
6. **Publication** : Mise à disposition du contenu validé
7. **Versionnement** : Mises à jour successives avec création de nouvelles versions

### Interface d'article

L'interface de gestion des articles comprend :

- Éditeur de contenu avec formatage
- Gestion des pièces jointes
- Visualisation de l'historique des versions
- Comparaison entre versions
- Restauration de versions antérieures
- Journal des modifications spécifiques à l'article

## Développement

### Scripts disponibles

- `npm run dev` : Démarre les serveurs frontend et backend en mode développement
- `npm run dev:backend` : Démarre uniquement le serveur backend
- `npm run dev:frontend` : Démarre uniquement le serveur frontend
- `npm run db:studio` : Lance Prisma Studio pour explorer la base de données
- `npm run db:migrate` : Applique les migrations Prisma
- `npm run db:reset` : Réinitialise la base de données (attention : supprime toutes les données)

### Extension du modèle de données

Pour ajouter un nouveau modèle ou modifier un existant :

1. Modifier le fichier `backend/prisma/schema.prisma`
2. Créer une migration
   ```bash
   npm run db:migrate -- --name descriptif_modification
   ```
3. Mettre à jour les types GraphQL et les resolvers dans le backend
4. Générer ou mettre à jour les types TypeScript pour le frontend

### Ajout de nouvelles fonctionnalités

Pour ajouter une nouvelle fonctionnalité :

1. Créer les modèles de données nécessaires
2. Implémenter les resolvers GraphQL dans le backend
3. Ajouter les requêtes/mutations GraphQL dans le frontend
4. Créer les composants UI nécessaires
5. Mettre à jour la navigation si nécessaire

## Déploiement

### Backend

1. Construire l'application
   ```bash
   cd backend
   npm run build
   ```

2. Configurer les variables d'environnement de production

3. Démarrer le serveur
   ```bash
   npm run start:prod
   ```

### Frontend

1. Construire l'application
   ```bash
   cd frontend
   npm run build
   ```

2. Démarrer le serveur Next.js
   ```bash
   npm run start
   ```

Alternativement, vous pouvez déployer le frontend sur Vercel ou une autre plateforme compatible avec Next.js.

## Dépannage

### Problèmes courants et solutions

1. **Erreur de connexion à la base de données**
   - Vérifier les informations de connexion dans le fichier `.env`
   - S'assurer que PostgreSQL est en cours d'exécution

2. **Erreurs GraphQL**
   - Vérifier la correspondance entre les schémas GraphQL et Prisma
   - Utiliser les outils de développement du navigateur pour analyser les requêtes

3. **Problèmes d'authentification**
   - Vérifier les secrets JWT et NextAuth
   - S'assurer que les tokens ne sont pas expirés

4. **Erreurs de compilation TypeScript**
   - Mettre à jour les types générés
   - Vérifier la compatibilité des versions des dépendances

