'use client';

import { useQuery } from '@apollo/client';
import { ARTICLE_QUERY } from '@/graphql/queries/articles';
import { ArticleForm } from '@/components/forms/article-form';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';
import { ArticleStatus } from '@/types/generated/graphql';

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Récupération des données de l'article
  const { data, loading } = useQuery(ARTICLE_QUERY, {
    variables: { id },
  });

  const article = data?.article;
  
  // Vérification des droits d'accès
  useEffect(() => {
    if (status === 'authenticated' && article) {
      const userRole = session?.user.role;
      const isAuthor = session?.user.id === article.author.id;
      
      const canEdit = 
        userRole === 'ADMIN' || 
        userRole === 'EDITOR' || 
        (isAuthor && article.status === ArticleStatus.DRAFT);
      
      if (!canEdit) {
        router.push(`/articles/${id}`);
      }
    }
  }, [session, status, article, id, router]);

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Article non trouvé</h2>
        <p className="text-gray-600 mt-2">L'article que vous recherchez n'existe pas ou a été supprimé.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Modifier l'article</h1>
      <ArticleForm article={article} />
    </div>
  );
}
