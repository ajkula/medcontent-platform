'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { ARTICLES_QUERY } from '@/graphql/queries/articles';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { debounce, formatDate } from '@/lib/utils';
import { Article, ArticleStatus } from '@/types/generated/graphql';
import { useSession } from 'next-auth/react';
import { ARTICLE_STATUS_LABELS } from '@/lib/constants';
import { useDebounce } from '@/hooks/useDebounce';

export default function ArticlesPage() {
  const { data: session } = useSession();
  const [inputValue, setInputValue] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });
  
  // Récupération des articles avec filtres
  const { data, loading, refetch } = useQuery(ARTICLES_QUERY, {
    variables: {
      status: filters.status || undefined,
      searchTerm: filters.search || undefined,
    },
  });

  useEffect(() => {
      refetch({
        status: filters.status || undefined,
        searchTerm: filters.search || undefined,
      });
  }, [filters, refetch])

  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setFilters(prev => ({ ...prev, search: value }));
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSetSearch(value);
  };
  
  const handleStatusChange = (status: string) => {
    setFilters(prev => ({ ...prev, status }));
  };

  const clearFilters = () => {
    setInputValue('');
    setFilters({ status: '', search: '' });
  }

  const articles = data?.articles || [];
  
  // Vérification des droits d'accès pour la création d'articles
  const canCreateArticle = session?.user.role === 'ADMIN' || session?.user.role === 'EDITOR';
  
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Articles</h1>
        {canCreateArticle && (
          <Link href="/articles/create">
            <Button>Nouvel article</Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des articles</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="Rechercher par titre ou contenu..."
                value={inputValue}
                onChange={handleSearchChange}
                className="max-w-md"
              />
              <Button type="button" onClick={clearFilters}>Nettoyer</Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.status === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('')}
              >
                Tous
              </Button>
              {Object.values(ArticleStatus).map((status) => (
                <Button
                  key={status}
                  variant={filters.status === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange(status)}
                >
                  {getStatusLabel(status)}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Tableau des articles */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead>Dernière mise à jour</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-gray-500">Chargement des articles...</p>
                  </TableCell>
                </TableRow>
              ) : articles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                    {filters.search || filters.status
                      ? 'Aucun article ne correspond aux critères de recherche'
                      : 'Aucun article disponible'}
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
                    <TableCell>{article.author.name}</TableCell>
                    <TableCell>{formatDate(article.createdAt)}</TableCell>
                    <TableCell>{formatDate(article.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/articles/${article.id}`}>
                          <Button variant="outline" size="sm">
                            Voir
                          </Button>
                        </Link>
                        {(session?.user.role === 'ADMIN' || 
                          session?.user.role === 'EDITOR' ||
                          (session?.user.id === article.author.id && article.status === ArticleStatus.DRAFT)) && (
                          <Link href={`/articles/${article.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              Modifier
                            </Button>
                          </Link>
                        )}
                      </div>
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
