# MedContent Platform - Frontend

Cette application Next.js est le frontend de la plateforme MedContent, conçue pour la gestion de contenu médical avec un système complet de versionnement et de traçabilité.

## Technologies utilisées

- **Next.js** avec App Router
- **TypeScript**
- **Apollo Client** pour GraphQL
- **NextAuth.js** pour l'authentification
- **Tailwind CSS** pour les styles
- **React Hook Form** avec Yup pour la validation de formulaires

## Structure du projet

```
frontend/
├── src/
│   ├── app/                    # Routes de l'application (App Router)
│   │   ├── layout.tsx          # Layout racine avec providers
│   │   ├── page.tsx            # Page d'accueil/redirection
│   │   ├── auth/               # Pages d'authentification 
│   │   └── (authenticated)/    # Pages nécessitant authentification
│   ├── components/             # Composants réutilisables
│   │   ├── ui/                 # Composants d'interface
│   │   ├── forms/              # Composants de formulaires
│   │   └── layouts/            # Composants de mise en page
│   ├── lib/                    # Utilitaires et configurations
│   ├── graphql/                # Requêtes et mutations GraphQL
│   └── types/                  # Types TypeScript
├── public/                     # Fichiers statiques
└── tailwind.config.js          # Configuration Tailwind
```

## Configuration

1. Clonez ce dépôt
2. Installez les dépendances avec `npm install` ou `yarn install`
3. Créez un fichier `.env.local` avec les variables d'environnement suivantes :

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre-secret-ici
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/graphql
```

## Dépendances principales

Vous devez installer les dépendances suivantes :

```bash
npm install next@latest react@latest react-dom@latest
npm install @apollo/client graphql
npm install next-auth
npm install react-hook-form @hookform/resolvers yup
npm install tailwindcss postcss autoprefixer
npm install class-variance-authority clsx tailwind-merge
npm install tailwindcss-animate @tailwindcss/typography
```

## Démarrage

Pour démarrer l'application en mode développement :

```bash
npm run dev
# ou
yarn dev
```

L'application sera accessible à l'adresse [http://localhost:3000](http://localhost:3000).

## Fonctionnalités principales

- **Authentification** : connexion, inscription et gestion de session
- **Gestion des articles** : création, édition, publication, archivage
- **Versionnement** : historique et restauration des versions précédentes
- **Gestion des catégories** : association d'articles à des catégories
- **Journal des modifications** : traçabilité complète des changements

## Rôles utilisateurs

- **ADMIN** : accès complet à toutes les fonctionnalités
- **EDITOR** : création et édition de contenu
- **REVIEWER** : validation du contenu
- **READER** : consultation uniquement

## Backend requis

Cette application frontend nécessite un backend GraphQL compatible avec le schéma fourni dans `schema.gql`. Le backend doit être construit avec NestJS, Prisma (PostgreSQL) et GraphQL comme spécifié dans les exigences du projet.
