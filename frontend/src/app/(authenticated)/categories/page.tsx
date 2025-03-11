'use client';

import { useQuery, useMutation } from '@apollo/client';
import { CATEGORIES_QUERY } from '@/graphql/queries/categories';
import { DELETE_CATEGORY_MUTATION } from '@/graphql/mutations/categories';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function CategoriesPage() {
  const { data: session } = useSession();
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  
  // Récupération des catégories
  const { data, loading, refetch } = useQuery(CATEGORIES_QUERY);
  
  // Mutation pour supprimer une catégorie
  const [deleteCategory, { loading: deleteLoading }] = useMutation(DELETE_CATEGORY_MUTATION, {
    onCompleted: () => {
      setCategoryToDelete(null);
      refetch();
    },
  });

  const categories = data?.categories || [];
  
  // Vérification des droits d'accès
  const canManageCategories = session?.user.role === 'ADMIN' || session?.user.role === 'EDITOR';
  
  // Fonction pour supprimer une catégorie
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      await deleteCategory({
        variables: {
          id: categoryToDelete,
        },
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Catégories</h1>
        {canManageCategories && (
          <Link href="/categories/create">
            <Button>Nouvelle catégorie</Button>
          </Link>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Liste des catégories</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Chargement des catégories...</p>
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune catégorie disponible</p>
              {canManageCategories && (
                <Link href="/categories/create">
                  <Button variant="outline" className="mt-4">
                    Créer une catégorie
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div 
                  key={category.id} 
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <h3 className="font-medium text-lg mb-2">{category.name}</h3>
                    {category.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">{category.description}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <Link href={`/categories/${category.id}`}>
                        <Button variant="outline" size="sm">
                          Voir les articles
                        </Button>
                      </Link>
                      {canManageCategories && (
                        <div className="flex space-x-2">
                          <Link href={`/categories/${category.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              Modifier
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setCategoryToDelete(category.id)}
                          >
                            Supprimer
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Modal de confirmation de suppression */}
      {categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirmer la suppression</h3>
            <p className="text-gray-700 mb-6">
              Êtes-vous sûr de vouloir supprimer cette catégorie ? 
              Cette action est irréversible et supprimera l'association avec tous les articles liés.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setCategoryToDelete(null)}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteCategory}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Suppression...' : 'Supprimer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
