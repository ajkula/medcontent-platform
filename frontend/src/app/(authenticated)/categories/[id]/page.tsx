'use client';

import { useQuery } from '@apollo/client';
import { CATEGORY_QUERY } from '@/graphql/queries/categories';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { Article, ArticleStatus } from '@/types/generated/graphql';
import { use } from 'react';
import { ARTICLE_STATUS_LABELS } from '@/lib/constants';

export default function CategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  
  // Récupération des données de la catégorie
  const { data, loading } = useQuery(CATEGORY_QUERY, {
    variables: { id },
  });

  const category = data?.category;
  const articles = category?.articles || [];
  
  // Vérification des droits d'accès
  const canManageCategories = session?.user.role === 'ADMIN' || session?.user.role === 'EDITOR';
  
  // Fonction pour obtenir le libellé du statut
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
  
  // Fonction pour obtenir la variante du badge selon le statut
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la catégorie...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Catégorie non trouvée</h2>
        <p className="text-gray-600 mt-2">La catégorie que vous recherchez n'existe pas ou a été supprimée.</p>
        <Link href="/categories">
          <Button className="mt-6">Retour aux catégories</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="text-gray-600 mt-2">{category.description}</p>
          )}
        </div>
        {canManageCategories && (
          <Link href={`/categories/${id}/edit`}>
            <Button>Modifier</Button>
          </Link>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Articles dans cette catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Aucun article dans cette catégorie
                  </TableCell>
                </TableRow>
              ) : (
                articles.map((article: Article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(article.status)}>
                        {getStatusLabel(article.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{article.author?.name ?? '-'}</TableCell>
                    <TableCell>{formatDate(article.createdAt)}</TableCell>
                    <TableCell>
                      <Link href={`/articles/${article.id}`}>
                        <Button variant="outline" size="sm">
                          Voir l'article
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
    </div>
  );
}
