'use client';

import { useState, useEffect, use } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useQuery, useMutation } from '@apollo/client';
import { CATEGORY_QUERY } from '@/graphql/queries/categories';
import { UPDATE_CATEGORY_MUTATION } from '@/graphql/mutations/categories';
import { useRouter } from 'next/navigation';
import { Form, FormField } from '@/components/forms/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';

// Schéma de validation
const categorySchema = yup.object({
  name: yup
    .string()
    .required('Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
  description: yup
    .string()
    .optional(),
});

type CategoryFormValues = yup.InferType<typeof categorySchema>;

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); 
  
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  
  // Récupération des données de la catégorie
  const { data, loading: categoryLoading } = useQuery(CATEGORY_QUERY, {
    variables: { id },
    onCompleted: (data) => {
      if (data.category) {
        form.reset({
          name: data.category.name,
          description: data.category.description || '',
        });
      }
    },
  });
  
  // Vérification des droits d'accès
  useEffect(() => {
    if (status === 'authenticated') {
      const userRole = session?.user.role;
      if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
        router.push(`/categories/${id}`);
      }
    }
  }, [session, status, router, id]);
  
  // Mutation pour mettre à jour une catégorie
  const [updateCategory, { loading: updateLoading }] = useMutation(UPDATE_CATEGORY_MUTATION, {
    onError: (error) => {
      setError(error.message || 'Une erreur est survenue lors de la mise à jour de la catégorie');
    },
    onCompleted: () => {
      router.push(`/categories/${id}`);
    },
  });
  
  // Initialisation du formulaire
  const form = useForm<CategoryFormValues>({
    resolver: yupResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (values: CategoryFormValues) => {
    setError(null);
    
    try {
      await updateCategory({
        variables: {
          id,
          data: {
            name: values.name,
            description: values.description || undefined,
          },
        },
      });
    } catch (err) {
      // L'erreur est déjà gérée par onError du useMutation
    }
  };

  const category = data?.category;
  const isLoading = categoryLoading || status === 'loading';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Catégorie non trouvée</h2>
        <p className="text-gray-600 mt-2">La catégorie que vous recherchez n'existe pas ou a été supprimée.</p>
        <Button className="mt-6" onClick={() => router.push('/categories')}>
          Retour aux catégories
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Modifier la catégorie</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        {error && (
          <div className="mb-6 p-4 text-sm text-red-800 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        
        <Form form={form} onSubmit={onSubmit} className="space-y-6">
          <FormField
            name="name"
            label="Nom de la catégorie"
            error={form.formState.errors.name?.message}
          >
            <Input
              id="name"
              placeholder="Entrez le nom de la catégorie"
              {...form.register('name')}
            />
          </FormField>
          
          <FormField
            name="description"
            label="Description (optionnelle)"
            error={form.formState.errors.description?.message}
          >
            <textarea
              id="description"
              className="w-full p-2 min-h-[100px] border border-gray-300 rounded-md"
              placeholder="Description de la catégorie..."
              {...form.register('description')}
            />
          </FormField>
          
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/categories/${id}`)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={updateLoading}
            >
              {updateLoading ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
