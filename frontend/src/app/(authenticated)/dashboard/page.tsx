'use client';

import { useQuery } from '@apollo/client';
import { ARTICLES_QUERY } from '@/graphql/queries/articles';
import { CATEGORIES_QUERY } from '@/graphql/queries/categories';
import { ME_QUERY } from '@/graphql/queries/auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { ArticleStatus } from '@/types/generated/graphql';
import { ARTICLE_STATUS_LABELS } from '@/lib/constants';

export default function DashboardPage() {
  // Récupération des données utilisateur
  const { data: userData, loading: userLoading } = useQuery(ME_QUERY);
  
  // Récupération des articles récents (limités à 5)
  const { data: articlesData, loading: articlesLoading } = useQuery(ARTICLES_QUERY, {
    variables: {
      take: 5,
    },
  });
  
  // Récupération des catégories
  const { data: categoriesData, loading: categoriesLoading } = useQuery(CATEGORIES_QUERY);

  const isLoading = userLoading || articlesLoading || categoriesLoading;
  
  // Fonction pour obtenir la classe de couleur en fonction du statut de l'article
  const getStatusBadgeVariant = (status: ArticleStatus) => {
    switch (status) {
      case ArticleStatus.DRAFT:
        return 'secondary';
      case ArticleStatus.UNDER_REVIEW:
        return 'info';
      case ArticleStatus.PUBLISHED:
        return 'success';
      case ArticleStatus.ARCHIVED:
        return 'destructive';
      default:
        return 'default';
    }
  };
  
  // Traduction des statuts d'article
  const getStatusLabel = (status: ArticleStatus) => {
    switch (status) {
      case ArticleStatus.DRAFT:
        return ARTICLE_STATUS_LABELS.draft;
      case ArticleStatus.UNDER_REVIEW:
        return ARTICLE_STATUS_LABELS.underReview;
      case ArticleStatus.PUBLISHED:
        return ARTICLE_STATUS_LABELS.published;
      case ArticleStatus.ARCHIVED:
        return ARTICLE_STATUS_LABELS.archived;
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  const user = userData?.me;
  const articles = articlesData?.articles || [];
  const categories = categoriesData?.categories || [];

  console.log({ user });

  return (
    <div className="space-y-6">
      {/* En-tête du tableau de bord */}
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-gray-600">
          Bienvenue, {user?.name}. Voici votre aperçu de contenu.
        </p>
      </div>
      
      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{articles.length}</div>
            <div className="text-sm text-gray-500">Articles récents</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{categories.length}</div>
            <div className="text-sm text-gray-500">Catégories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {articles.filter((a: any) => a.status === ArticleStatus.PUBLISHED).length}
            </div>
            <div className="text-sm text-gray-500">Articles publiés</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {articles.filter((a: any) => a.status === ArticleStatus.DRAFT).length}
            </div>
            <div className="text-sm text-gray-500">Brouillons</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Articles récents */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Articles récents</CardTitle>
            <Link href="/articles">
              <Button
                variant="outline"
                size="sm"
              >
                Voir tous les articles
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead> </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                    Aucun article disponible
                  </TableCell>
                </TableRow>
              ) : (
                articles.map((article: any) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(article.status)}>
                        {getStatusLabel(article.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{article.author.name}</TableCell>
                    <TableCell>{formatDate(article.createdAt)}</TableCell>
                    <TableCell>
                      <Link href={`/articles/${article.id}`}>
                        <Button variant="ghost" size="sm">
                          Voir
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Catégories */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Catégories</CardTitle>
            <Link href="/categories">
              <Button variant="outline" size="sm">
                Voir toutes les catégories
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.length === 0 ? (
              <p className="text-gray-500 col-span-full text-center py-4">
                Aucune catégorie disponible
              </p>
            ) : (
              categories.map((category: any) => (
                <Link href={`/categories/${category.id}`} key={category.id}>
                  <div className="p-4 border rounded-md hover:bg-gray-50 transition-colors h-28 flex flex-col">
                    <h3 className="font-medium text-base mb-1">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 overflow-hidden">
                        {category.description}
                      </p>
                    )}
                    <div className='mt-auto'></div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}