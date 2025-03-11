Je vais te préparer une description précise et complète du frontend pour notre future conversation. Cette description sera structurée pour que je puisse facilement reconstruire l'application frontend avec la stack Next.js/TypeScript/Apollo en utilisant le schéma GraphQL que tu fourniras comme contrat d'interface.
Description technique du frontend MedContent Platform
1. Architecture globale

Framework: Next.js avec App Router
Langage: TypeScript
Client GraphQL: Apollo Client
Authentification: NextAuth.js
Validation de formulaires: React Hook Form + Yup
Styles: Tailwind CSS

2. Structure des répertoires
frontend/
├── src/
│   ├── app/                    # Routes de l'application (App Router)
│   │   ├── layout.tsx          # Layout racine avec providers
│   │   ├── page.tsx            # Page d'accueil/redirection
│   │   ├── auth/               # Pages d'authentification 
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (authenticated)/    # Pages nécessitant authentification
│   │   │   ├── layout.tsx      # Layout avec vérification d'auth
│   │   │   ├── dashboard/
│   │   │   ├── articles/
│   │   │   ├── categories/
│   │   │   └── changelogs/
│   │   └── api/                # Routes API
│   │       └── auth/
│   ├── components/             # Composants réutilisables
│   │   ├── ui/                 # Composants d'interface
│   │   ├── forms/              # Composants de formulaires
│   │   └── layouts/            # Composants de mise en page
│   ├── lib/                    # Utilitaires et configurations
│   │   ├── apollo-client.ts    # Configuration Apollo
│   │   ├── apollo-wrapper.tsx  # Provider Apollo
│   │   ├── auth-provider.tsx   # Provider Auth
│   │   └── auth-options.ts     # Options NextAuth
│   ├── graphql/                # Requêtes et mutations GraphQL
│   │   ├── queries/
│   │   └── mutations/
│   └── types/                  # Types TypeScript
│       ├── auth.ts
│       ├── articles.ts
│       └── generated/          # Types générés depuis le schéma
├── public/                     # Fichiers statiques
└── tailwind.config.js          # Configuration Tailwind

3. Flux d'authentification

Login/Register:

Pages publiques avec formulaires de connexion/inscription
Utilisation de mutations GraphQL via Apollo pour authentification
Stockage du JWT via NextAuth.js
Redirection vers Dashboard après authentification


Protection des routes:

Layout authenticated vérifiant session active
Redirection vers login si non authentifié
Vérification des rôles pour accès à certaines fonctionnalités



4. Pages principales et fonctionnalités
Dashboard (/dashboard)

Composants:

Résumé statistique (articles, catégories)
Liste d'articles récents (5 derniers)
Aperçu des catégories


Requêtes GraphQL:

GetDashboardData - statistiques et données récentes



Articles (/articles)

Liste des articles:

Filtrage par statut (DRAFT, UNDER_REVIEW, PUBLISHED, ARCHIVED)
Recherche textuelle (titre, contenu)
Pagination
Actions selon rôle utilisateur


Détail d'article (/articles/[id]):

Affichage complet avec métadonnées
Onglets: Contenu, Versions, Historique
Liste des pièces jointes
Actions: Édition, Suppression, Restauration de version


Création/Édition (/articles/create, /articles/[id]/edit):

Formulaire riche avec validation
Sélection de catégories multiples
Upload de pièces jointes
Modifications avec motif (pour traçabilité)



Catégories (/categories)

Liste des catégories:

Aperçu du nombre d'articles par catégorie


Détail catégorie (/categories/[id]):

Liste des articles dans cette catégorie


Gestion de catégories:

Création, édition, suppression (pour Admin/Editor)
Association avec articles



Journal des modifications (/changelogs)

Historique complet des modifications
Filtrage par type d'entité, utilisateur
Affichage détaillé des changements
Lien vers les entités modifiées

5. Interactions GraphQL clés
Mutations principales:

login - Authentification utilisateur
signup - Création de compte
createArticle - Création d'article
updateArticle - Mise à jour avec nouvelle version
deleteArticle - Suppression d'article
restoreArticleVersion - Restauration version précédente

Requêtes principales:

me - Profil utilisateur courant
articles - Liste paginée et filtrée
article - Détail d'un article
articleVersions - Historique des versions
categories - Liste de catégories
entityChangeLogs - Historique de modifications

6. Gestion des erreurs et états UI

Écrans de chargement pour opérations asynchrones
Notifications pour succès/échec des opérations
Validation de formulaires avec messages d'erreur
Gestion des erreurs réseau et GraphQL
États d'authentification (chargement, succès, échec)

7. Fonctionnalités spécifiques
Versionnement d'articles

Chaque modification crée une nouvelle version
Interface de comparaison entre versions
Restauration à une version précédente
Métadonnées de version (auteur, date, motif)

Traçabilité (Changelog)

Enregistrement automatique des modifications
Interface de visualisation des changements
Filtrage par opération (CREATE, UPDATE, DELETE)
Détail des champs modifiés (avant/après)

Gestion des rôles

ADMIN: Accès complet, gestion utilisateurs
EDITOR: Création/édition de contenu
REVIEWER: Validation du contenu
READER: Consultation uniquement
UI adaptative selon le rôle

Cette description détaillée servira de plan pour reconstruire le frontend en utilisant le schéma GraphQL comme contrat d'interface précis, garantissant que toutes les fonctionnalités seront correctement implémentées.