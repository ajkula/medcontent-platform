'use client';

import { useQuery, useMutation } from '@apollo/client';
import { ARTICLE_QUERY, ARTICLE_VERSIONS_QUERY } from '@/graphql/queries/articles';
import { ENTITY_CHANGELOGS_QUERY } from '@/graphql/queries/changelogs';
import { DELETE_ARTICLE_MUTATION, RESTORE_ARTICLE_VERSION_MUTATION } from '@/graphql/mutations/articles';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import { formatDate } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { ArticleStatus, ChangeOperation } from '@/types/generated/graphql';
import { ARTICLE_STATUS_LABELS, CHANGE_OPERATION_LABELS } from '@/lib/constants';

export default function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'content' | 'versions' | 'history'>('content');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [restoreVersionId, setRestoreVersionId] = useState<string | null>(null);
  const [restoreReason, setRestoreReason] = useState('');
  
  // Récupération des données de l'article
  const { data: articleData, loading: articleLoading, refetch: refetchArticle } = useQuery(ARTICLE_QUERY, {
    variables: { id },
  });
  
  // Récupération des versions de l'article
  const { data: versionsData, loading: versionsLoading } = useQuery(ARTICLE_VERSIONS_QUERY, {
    variables: { articleId: id },
    skip: activeTab !== 'versions',
  });
  
  // Récupération de l'historique des modifications
  const { data: historyData, loading: historyLoading } = useQuery(ENTITY_CHANGELOGS_QUERY, {
    variables: { entityId: id, entityType: 'Article' },
    skip: activeTab !== 'history',
  });
  
  // Mutation pour supprimer un article
  const [deleteArticle, { loading: deleteLoading }] = useMutation(DELETE_ARTICLE_MUTATION, {
    onCompleted: () => {
      router.push('/articles');
    },
  });
  
  // Mutation pour restaurer une version
  const [restoreVersion, { loading: restoreLoading }] = useMutation(RESTORE_ARTICLE_VERSION_MUTATION, {
    onCompleted: () => {
      setRestoreVersionId(null);
      setRestoreReason('');
      refetchArticle();
    },
  });

  const article = articleData?.article;
  const versions = versionsData?.articleVersions || [];
  const changeLogs = historyData?.entityChangeLogs || [];
  
  const isLoading = articleLoading || 
    (activeTab === 'versions' && versionsLoading) || 
    (activeTab === 'history' && historyLoading);
  
  // Vérification des droits d'accès
  const isAuthor = session?.user.id === article?.author.id;
  const isAdmin = session?.user.role === 'ADMIN';
  const isEditor = session?.user.role === 'EDITOR';
  const isReviewer = session?.user.role === 'REVIEWER';
  
  const canEdit = isAdmin || isEditor || (isAuthor && article?.status === ArticleStatus.DRAFT);
  const canDelete = isAdmin || (isEditor && article?.status !== ArticleStatus.PUBLISHED);
  const canRestore = isAdmin || isEditor || (isAuthor && article?.status === ArticleStatus.DRAFT);
  
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
  
  // Traduction des opérations de modification
  const getOperationLabel = (operation: ChangeOperation) => {
    switch (operation) {
      case ChangeOperation.CREATE:
        return CHANGE_OPERATION_LABELS.create;
      case ChangeOperation.UPDATE:
        return CHANGE_OPERATION_LABELS.update;
      case ChangeOperation.DELETE:
        return CHANGE_OPERATION_LABELS.delete;
      default:
        return operation;
    }
  };
  
  // Gestion de la suppression d'article
  const handleDeleteArticle = async () => {
    if (!canDelete) return;
    
    try {
      await deleteArticle({
        variables: {
          id,
          reason: deleteReason || undefined,
        },
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'article:', error);
    }
  };
  
  // Gestion de la restauration de version
  const handleRestoreVersion = async () => {
    if (!canRestore || !restoreVersionId) return;
    
    try {
      await restoreVersion({
        variables: {
          articleId: id,
          versionId: restoreVersionId,
          reason: restoreReason || undefined,
        },
      });
    } catch (error) {
      console.error('Erreur lors de la restauration de la version:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Article non trouvé</h2>
        <p className="text-gray-600 mt-2">L'article que vous recherchez n'existe pas ou a été supprimé.</p>
        <Link href="/articles">
          <Button className="mt-6">Retour à la liste des articles</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{article.title}</h1>
          <div className="flex items-center space-x-4 mt-2">
            <Badge variant={
              article.status === ArticleStatus.DRAFT ? 'secondary' :
              article.status === ArticleStatus.UNDER_REVIEW ? 'info' :
              article.status === ArticleStatus.PUBLISHED ? 'success' :
              'destructive'
            }>
              {getStatusLabel(article.status)}
            </Badge>
            <span className="text-sm text-gray-500">
              Par {article.author.name}
            </span>
            <span className="text-sm text-gray-500">
              Créé le {formatDate(article.createdAt)}
            </span>
            {article.publishedAt && (
              <span className="text-sm text-gray-500">
                Publié le {formatDate(article.publishedAt)}
              </span>
            )}
          </div>
        </div>
        <div className="flex space-x-3">
          {canEdit && (
            <Link href={`/articles/${id}/edit`}>
              <Button>Modifier</Button>
            </Link>
          )}
          {canDelete && (
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteConfirm(true)}
            >
              Supprimer
            </Button>
          )}
        </div>
      </div>
      
      {/* Catégories */}
      {article.categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {article.categories.map((category) => (
            <Link href={`/categories/${category.id}`} key={category.id}>
              <Badge variant="secondary" className="cursor-pointer">
                {category.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}
      
      {/* Onglets */}
      <div className="border-b">
        <div className="flex space-x-6">
          <button
            className={`py-3 font-medium border-b-2 ${
              activeTab === 'content'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('content')}
          >
            Contenu
          </button>
          <button
            className={`py-3 font-medium border-b-2 ${
              activeTab === 'versions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('versions')}
          >
            Versions
          </button>
          <button
            className={`py-3 font-medium border-b-2 ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('history')}
          >
            Historique
          </button>
        </div>
      </div>
      
      {/* Contenu de l'onglet actif */}
      <div className="mt-6">
        {activeTab === 'content' && (
          <Card>
            <CardContent className="pt-6">
              {article.currentVersion ? (
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: article.currentVersion.content }} />
                </div>
              ) : (
                <p className="text-gray-500">Cet article n'a pas encore de contenu.</p>
              )}
            </CardContent>
            {article.currentVersion?.attachments.length > 0 && (
              <CardFooter className="border-t mt-6 flex flex-col items-start">
                <h3 className="font-medium mb-3">Pièces jointes</h3>
                <ul className="space-y-2">
                  {article.currentVersion.attachments.map((attachment) => (
                    <li key={attachment.id} className="flex items-center space-x-2">
                      <a 
                        href={attachment.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {attachment.fileName}
                      </a>
                      <span className="text-sm text-gray-500">
                        ({(attachment.fileSize / 1024).toFixed(2)} KB)
                      </span>
                    </li>
                  ))}
                </ul>
              </CardFooter>
            )}
          </Card>
        )}
        
        {activeTab === 'versions' && (
          <Card>
            <CardHeader>
              <CardTitle>Historique des versions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Créée par</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Pièces jointes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {versions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                        Aucune version disponible
                      </TableCell>
                    </TableRow>
                  ) : (
                    versions.map((version) => (
                      <TableRow key={version.id}>
                        <TableCell>
                          <div className="font-medium">
                            Version {version.versionNumber}
                            {article.currentVersion?.id === version.id && (
                              <Badge variant="success" className="ml-2">Actuelle</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{version.createdBy.name}</TableCell>
                        <TableCell>{formatDate(version.createdAt)}</TableCell>
                        <TableCell>{version.attachments.length}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                // Ici, on pourrait ouvrir une modal pour afficher le contenu de cette version
                                // Pour simplifier, on utilise un alert
                                alert(`Contenu de la version ${version.versionNumber}:\n\n${version.content}`);
                              }}
                            >
                              Voir
                            </Button>
                            {canRestore && article.currentVersion?.id !== version.id && (
                              <Button 
                                size="sm" 
                                variant="secondary"
                                onClick={() => setRestoreVersionId(version.id)}
                              >
                                Restaurer
                              </Button>
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
        )}
        
        {activeTab === 'history' && (
          <Card>
            <CardHeader>
              <CardTitle>Historique des modifications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Opération</TableHead>
                    <TableHead>Motif</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {changeLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                        Aucun historique disponible
                      </TableCell>
                    </TableRow>
                  ) : (
                    changeLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{formatDate(log.createdAt)}</TableCell>
                        <TableCell>{log.user.name}</TableCell>
                        <TableCell>
                          <Badge variant={
                            log.operation === ChangeOperation.CREATE ? 'success' :
                            log.operation === ChangeOperation.UPDATE ? 'info' :
                            'destructive'
                          }>
                            {getOperationLabel(log.operation)}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.reason || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-700 mb-4">
              Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motif de suppression (optionnel)
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Indiquez le motif de suppression..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteArticle}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Suppression...' : 'Supprimer'}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de restauration de version */}
      {restoreVersionId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Restaurer une version</h3>
            <p className="text-gray-700 mb-4">
              Êtes-vous sûr de vouloir restaurer cette version de l'article ? 
              Cela créera une nouvelle version basée sur celle-ci.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motif de restauration (optionnel)
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={restoreReason}
                onChange={(e) => setRestoreReason(e.target.value)}
                placeholder="Indiquez le motif de restauration..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setRestoreVersionId(null)}
              >
                Annuler
              </Button>
              <Button
                variant="secondary"
                onClick={handleRestoreVersion}
                disabled={restoreLoading}
              >
                {restoreLoading ? 'Restauration...' : 'Restaurer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
