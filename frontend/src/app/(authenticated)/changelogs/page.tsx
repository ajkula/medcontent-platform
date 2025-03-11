'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { CHANGELOGS_QUERY } from '@/graphql/queries/changelogs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { ChangeOperation } from '@/types/generated/graphql';

export default function ChangeLogsPage() {
  const [entityType, setEntityType] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // Récupération des journaux de modifications
  const { data, loading, refetch } = useQuery(CHANGELOGS_QUERY, {
    variables: {
      entityType: entityType || undefined,
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    },
  });

  const changeLogs = data?.changeLogs || [];
  
  // Fonction pour obtenir le libellé de l'opération
  const getOperationLabel = (operation: ChangeOperation) => {
    switch (operation) {
      case ChangeOperation.CREATE:
        return 'Création';
      case ChangeOperation.UPDATE:
        return 'Mise à jour';
      case ChangeOperation.DELETE:
        return 'Suppression';
      default:
        return operation;
    }
  };
  
  // Fonction pour obtenir la variante du badge selon l'opération
  const getOperationBadgeVariant = (operation: ChangeOperation) => {
    switch (operation) {
      case ChangeOperation.CREATE:
        return 'success';
      case ChangeOperation.UPDATE:
        return 'info';
      case ChangeOperation.DELETE:
        return 'destructive';
      default:
        return 'default';
    }
  };
  
  // Fonction pour obtenir le libellé du type d'entité
  const getEntityTypeLabel = (type: string) => {
    switch (type) {
      case 'Article':
        return 'Article';
      case 'Category':
        return 'Catégorie';
      case 'User':
        return 'Utilisateur';
      default:
        return type;
    }
  };
  
  // Fonction pour formater les changements
  const formatChanges = (changes: any) => {
    if (!changes) return null;
    
    try {
      // Si changes est déjà un objet, on l'utilise directement
      const changesObj = typeof changes === 'string' ? JSON.parse(changes) : changes;
      
      return (
        <div className="space-y-2">
          {Object.entries(changesObj).map(([field, value]: [string, any]) => {
            // Si la valeur est un objet avec before/after
            if (value && typeof value === 'object' && 'before' in value && 'after' in value) {
              return (
                <div key={field} className="text-sm">
                  <span className="font-medium">{field}:</span>{' '}
                  <span className="line-through text-red-600">{String(value.before || '')}</span>{' '}
                  <span className="text-green-600">{String(value.after || '')}</span>
                </div>
              );
            }
            
            // Sinon, on affiche simplement la valeur
            return (
              <div key={field} className="text-sm">
                <span className="font-medium">{field}:</span>{' '}
                {String(value || '')}
              </div>
            );
          })}
        </div>
      );
    } catch (error) {
      console.error('Erreur lors du formatage des changements:', error);
      return <span className="text-red-500">Format de changements invalide</span>;
    }
  };
  
  // Génération du lien vers l'entité
  const getEntityLink = (entityType: string, entityId: string) => {
    switch (entityType) {
      case 'Article':
        return `/articles/${entityId}`;
      case 'Category':
        return `/categories/${entityId}`;
      case 'User':
        return '#'; // Pas de page utilisateur dans notre application
      default:
        return '#';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Journal des modifications</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Historique des modifications</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={entityType === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setEntityType('');
                  setCurrentPage(1);
                  refetch({
                    entityType: undefined,
                    skip: 0,
                    take: pageSize,
                  });
                }}
              >
                Tous
              </Button>
              <Button
                variant={entityType === 'Article' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setEntityType('Article');
                  setCurrentPage(1);
                  refetch({
                    entityType: 'Article',
                    skip: 0,
                    take: pageSize,
                  });
                }}
              >
                Articles
              </Button>
              <Button
                variant={entityType === 'Category' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setEntityType('Category');
                  setCurrentPage(1);
                  refetch({
                    entityType: 'Category',
                    skip: 0,
                    take: pageSize,
                  });
                }}
              >
                Catégories
              </Button>
              <Button
                variant={entityType === 'User' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setEntityType('User');
                  setCurrentPage(1);
                  refetch({
                    entityType: 'User',
                    skip: 0,
                    take: pageSize,
                  });
                }}
              >
                Utilisateurs
              </Button>
            </div>
          </div>
          
          {/* Tableau des modifications */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Opération</TableHead>
                <TableHead>Changements</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-gray-500">Chargement des modifications...</p>
                  </TableCell>
                </TableRow>
              ) : changeLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                    {entityType
                      ? `Aucune modification trouvée pour le type d'entité "${getEntityTypeLabel(entityType)}"`
                      : 'Aucune modification enregistrée'}
                  </TableCell>
                </TableRow>
              ) : (
                changeLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </TableCell>
                    <TableCell>{log.user.name}</TableCell>
                    <TableCell>{getEntityTypeLabel(log.entityType)}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={getOperationBadgeVariant(log.operation)}>
                        {getOperationLabel(log.operation)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatChanges(log.changes)}
                    </TableCell>
                    <TableCell>
                      {log.reason || '-'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Link href={getEntityLink(log.entityType, log.entityId)}>
                        <Button variant="outline" size="sm">
                          Voir l'entité
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              disabled={currentPage === 1 || loading}
              onClick={() => {
                const newPage = currentPage - 1;
                setCurrentPage(newPage);
                refetch({
                  entityType: entityType || undefined,
                  skip: (newPage - 1) * pageSize,
                  take: pageSize,
                });
              }}
            >
              Précédent
            </Button>
            <span className="text-sm text-gray-500">
              Page {currentPage}
            </span>
            <Button
              variant="outline"
              disabled={changeLogs.length < pageSize || loading}
              onClick={() => {
                const newPage = currentPage + 1;
                setCurrentPage(newPage);
                refetch({
                  entityType: entityType || undefined,
                  skip: (newPage - 1) * pageSize,
                  take: pageSize,
                });
              }}
            >
              Suivant
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
