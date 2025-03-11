'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_ARTICLE_MUTATION, UPDATE_ARTICLE_MUTATION } from '@/graphql/mutations/articles';
import { CATEGORIES_QUERY } from '@/graphql/queries/categories';
import { Article, Category, ArticleStatus } from '@/types/generated/graphql';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, FormField } from './form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ARTICLE_STATUS_LABELS } from '@/lib/constants';
import { Select } from '@headlessui/react';

// Schéma de validation
const articleSchema = yup.object({
  title: yup
    .string()
    .required('Le titre est requis')
    .min(3, 'Le titre doit contenir au moins 3 caractères'),
  content: yup
    .string()
    .required('Le contenu est requis')
    .min(10, 'Le contenu doit contenir au moins 10 caractères'),
  categoryIds: yup
    .array()
    .of(yup.string())
    .optional(),
  status: yup
    .string()
    .oneOf(
      [ArticleStatus.DRAFT, ArticleStatus.UNDER_REVIEW, ArticleStatus.PUBLISHED, ArticleStatus.ARCHIVED],
      'Statut invalide'
    )
    .default(ArticleStatus.DRAFT),
  reason: yup
    .string()
    .optional(),
});

type ArticleFormValues = yup.InferType<typeof articleSchema>;

interface ArticleFormProps {
  article?: Article; // Pour le mode édition
}

export function ArticleForm({ article }: ArticleFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const statusOptions = [
    { value: ArticleStatus.DRAFT, label: ARTICLE_STATUS_LABELS.draft },
    { value: ArticleStatus.UNDER_REVIEW, label: ARTICLE_STATUS_LABELS.underReview },
    { value: ArticleStatus.PUBLISHED, label: ARTICLE_STATUS_LABELS.published },
    { value: ArticleStatus.ARCHIVED, label: ARTICLE_STATUS_LABELS.archived },
  ];
  
  // Récupération des catégories
  const { data: categoriesData, loading: categoriesLoading } = useQuery(CATEGORIES_QUERY);
  
  // Mutation pour créer ou mettre à jour un article
  const [createArticle, { loading: createLoading }] = useMutation(CREATE_ARTICLE_MUTATION, {
    onError: (error) => {
      setError(error.message || 'Une erreur est survenue lors de la création de l\'article');
    },
    onCompleted: (data) => {
      router.push(`/articles/${data.createArticle.id}`);
    },
  });
  
  const [updateArticle, { loading: updateLoading }] = useMutation(UPDATE_ARTICLE_MUTATION, {
    onError: (error) => {
      setError(error.message || 'Une erreur est survenue lors de la mise à jour de l\'article');
    },
    onCompleted: (data) => {
      router.push(`/articles/${data.updateArticle.id}`);
    },
  });

  const isLoading = createLoading || updateLoading || categoriesLoading;
  const isEditMode = !!article;

  // Initialisation du formulaire
  const form = useForm<ArticleFormValues>({
    resolver: yupResolver(articleSchema),
    defaultValues: {
      title: article?.title || '',
      content: article?.currentVersion?.content || '',
      categoryIds: article?.categories.map(cat => cat.id) || [],
      status: article?.status || ArticleStatus.DRAFT,
      reason: '',
    },
  });

  const onSubmit = async (values: ArticleFormValues) => {
    setError(null);
    
    try {
      if (isEditMode) {
        // Mode édition
        await updateArticle({
          variables: {
            id: article.id,
            data: {
              title: values.title,
              content: values.content,
              categoryIds: values.categoryIds,
              status: values.status,
              reason: values.reason || undefined,
            },
          },
        });
      } else {
        // Mode création
        await createArticle({
          variables: {
            data: {
              title: values.title,
              content: values.content,
              categoryIds: values.categoryIds,
              status: values.status,
              reason: values.reason || undefined,
            },
          },
        });
      }
    } catch (err) {
      // L'erreur est déjà gérée par onError du useMutation
    }
  };

  // Construction de la liste des catégories
  const categories: Category[] = categoriesData?.categories || [];

  return (
    <Form form={form} onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="p-4 text-sm text-red-800 border border-red-300 rounded-md bg-red-50">
          {error}
        </div>
      )}

      <FormField
        name="title"
        label="Titre de l'article"
        error={form.formState.errors.title?.message}
      >
        <Input
          id="title"
          type="text"
          placeholder="Entrez le titre de l'article"
          {...form.register('title')}
        />
      </FormField>

      <FormField
        name="content"
        label="Contenu"
        error={form.formState.errors.content?.message}
      >
        <textarea
          id="content"
          className="w-full p-2 min-h-[200px] border border-gray-300 rounded-md"
          placeholder="Contenu de l'article..."
          {...form.register('content')}
        />
      </FormField>

      <FormField
        name="categoryIds"
        label="Catégories"
      >
        <div className="flex flex-wrap gap-2">
          {categoriesLoading ? (
            <p>Chargement des catégories...</p>
          ) : (
            categories.map((category) => (
              <label key={category.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={category.id}
                  {...form.register('categoryIds')}
                />
                <span>{category.name}</span>
              </label>
            ))
          )}
        </div>
      </FormField>

      <FormField
        name='status'
        label="Statut de l'article"
        error={form.formState.errors.status?.message}
      >
        <Select
          id='status'
          {...form.register('status')}
          defaultValue={article?.status || ArticleStatus.DRAFT}
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormField>

      {isEditMode && (
        <FormField
          name="reason"
          label="Motif de modification"
          description="Veuillez indiquer la raison de cette modification (optionnel)"
          error={form.formState.errors.reason?.message}
        >
          <Input
            id="reason"
            type="text"
            placeholder="Ex: Correction d'une erreur, Mise à jour des informations..."
            {...form.register('reason')}
          />
        </FormField>
      )}

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          // variant="outline"
          onClick={() => router.back()}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading 
            ? (isEditMode ? 'Mise à jour...' : 'Création...') 
            : (isEditMode ? 'Mettre à jour' : 'Créer')}
        </Button>
      </div>
    </Form>
  );
}
