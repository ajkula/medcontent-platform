'use client';

import { ArticleForm } from '@/components/forms/article-form';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CreateArticlePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Vérification des droits d'accès
  useEffect(() => {
    if (status === 'authenticated') {
      const userRole = session?.user.role;
      if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
        router.push('/dashboard');
      }
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Créer un nouvel article</h1>
      <ArticleForm />
    </div>
  );
}
