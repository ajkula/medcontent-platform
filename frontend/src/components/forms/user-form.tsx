'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, UserRole } from '@/types/generated/graphql';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { USER_ROLE_LABELS } from '@/lib/constants';
import { useMutation } from '@apollo/client';
import { CREATE_USER_MUTATION, UPDATE_USER_MUTATION } from '@/graphql/mutations/users';
import { Form, FormField } from './form';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

const userSchema = yup.object({
  name: yup
    .string()
    .required('Le nom est requis')
    .min(3, 'Le nom doit contenir au moins 3 caractères'),
  email: yup
    .string()
    .required("L'email est requis")
    .min(7, "L'email doit contenir au moins 7 caractères"),
  role: yup
    .string()
    .oneOf(
      [UserRole.ADMIN, UserRole.EDITOR, UserRole.REVIEWER, UserRole.READER],
      'Role invalide'
    )
    .default(UserRole.READER),
  definePassword: yup
    .boolean()
    .default(false),
  password: yup
    .string()
    .when('definePassword', {
      is: true,
      then: (schema) => schema.required('Le mot de passe est requis')
        .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
      otherwise: (schema) => schema.notRequired()
    }),
  confirmPassword: yup
    .string()
    .when('definePassword', {
      is: true,
      then: (schema) => schema.required('La confirmation du mot de passe est requise')
        .oneOf([yup.ref('password')], 'Les mots de passe ne correspondentpas'),
      otherwise: (schema) => schema.notRequired(),
    })
});

type UserFormValues = yup.InferType<typeof userSchema>;

interface UserFormProps {
  user?: User
}

export function UserForm({ user }: UserFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [setupLink, setSetupLink] = useState<string | null>(null);

  const userRoleOptions = [
    { value: UserRole.ADMIN, label: USER_ROLE_LABELS.admin },
    { value: UserRole.EDITOR, label: USER_ROLE_LABELS.editor },
    { value: UserRole.REVIEWER, label: USER_ROLE_LABELS.reviewer },
    { value: UserRole.READER, label: USER_ROLE_LABELS.reader },
  ];

  const [createUser, { loading: createLoading }] = useMutation(CREATE_USER_MUTATION, {
    onError: (error) => {
      setError(error.message || 'Une erreur est survenue lors de la création de l\'utilisateur');
    },
    onCompleted: (data) => {
      if (data.createUser.setupLink) {
        setSetupLink(data.createUser.setSetupLink);
      } else {
        router.push(`/users/${data.createUser.user.id}`);
      }
    },
  });

  const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_USER_MUTATION, {
    onError: (error) => {
      setError(error.message || 'Une erreur est survenue lorsde lamise à jour de l\'utilisateur');
    },
    onCompleted: (data) => {
      console.log("Réponse création utilisateur:", data);
      if (data.createUser.setupLink) {
        setSetupLink(data.createUser.setSetupLink);
      } else {
        router.push(`/users/${data.createUser.user.id}`);
      }
    },
  });

  const isLoading = createLoading || updateLoading;
  const isEditMode = !!user;

  const form = useForm<UserFormValues>({
    resolver: yupResolver(userSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || UserRole.READER,
      definePassword: false,
      password: '',
      confirmPassword: '',
    },
  });

  const definePassword = form.watch('definePassword');

  // fn() pour copier lelien dans le clipboard
  const copyToClipboard = async () => {
    if (setupLink) {
      try {
        await navigator.clipboard.writeText(setupLink);
        alert('Lien copié dans le presse-papier');
      } catch (err) {
        console.error('Impossible de copier le lien', err);
      }
    }
  };

  const onSubmit = async (values: UserFormValues) => {
    setError(null);

    try {
      if (isEditMode) {
        await updateUser({
          variables: {
            id: user.id,
            data: {
              name: values.name,
              email: values.email,
              role: values.role,
            },
          },
        });
      } else {
        const userData = {
          name: values.name,
          email: values.email,
          role: values.role,
          ...(values.definePassword && values.password ? { password: values.password } : {})
        };

        // Ajoute le password si l'option activée
        if (values.definePassword && values.password) {
          Object.assign(userData, { password: values.password });
        }

        await createUser({
          variables: {
            data: userData,
          },
        });
      }
    } catch (err) {
      // noop 
    }
  };

  // Si un lien de configuration a été généré, afficher l'écran de confirmation
  if (setupLink) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Utilisateur créé avec succès</h2>
          <p className="mb-4">
            Partagez ce lien avec l'utilisateur pour qu'il puisse configurer son mot de passe.
          </p>
          
          <Alert className="mb-4 bg-amber-50 border-amber-200">
            <AlertTitle className="text-amber-800">Important</AlertTitle>
            <AlertDescription className="text-amber-700">
              Ce lien permet de définir le mot de passe du compte. Partagez-le uniquement avec l'utilisateur concerné.
              Il est valide pendant 72 heures.
            </AlertDescription>
          </Alert>
          
          <div className="p-3 bg-gray-100 rounded-md mb-4 break-all">
            <p className="text-sm font-mono">{setupLink}</p>
          </div>
          
          <div className="flex space-x-4">
            <Button onClick={copyToClipboard}>
              Copier le lien
            </Button>
            <Button onClick={() => router.push('/users')} variant="outline">
              Retour à la liste des utilisateurs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Form form={form} onSubmit={onSubmit} className='space-y-6'>
      {error && (
        <div className="p-4 text-sm text-red-800 border border-red-300 rounded-md bg-red-50">
          {error}
        </div>
      )}

      <FormField
        name='name'
        label="Nom de l'utilisateur"
        error={form.formState.errors.name?.message}
      >
        <Input
          id='name'
          type='text'
          placeholder="Entrez le nom de l'utilisateur"
          {...form.register('name')}
        />
      </FormField>

      <FormField
        name='email'
        label="Email de l'utilisateur"
        error={form.formState.errors.email?.message}
      >
        <Input
          id='email'
          type='email'
          placeholder="Entrez l'email de l'utilisateur"
          {...form.register('email')}
        />
      </FormField>

      <FormField
        name='role'
        label="Role de l'utilisateur"
        error={form.formState.errors.role?.message}
      >
        <Select
          id='role'
          {...form.register('role')}
          defaultValue={user?.role || UserRole.READER}
        >
          {userRoleOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormField>

      {!isEditMode && (
        <>
          <FormField
            name='definePassword'
            label='Définir un mot de passe manuellement'
            error={form.formState.errors.definePassword?.message}
          >
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='definePassword'
                {...form.register('definePassword')}
              />
              <label htmlFor="definePassword" className='text-sm text-gray-600'>
                Si non coché, l'utilisateur recevra un lien pour définir son mot de passe
              </label>
            </div>
          </FormField>

          {definePassword && (
            <>
              <FormField
                name='password'
                label='Mot de passe'
                error={form.formState.errors.password?.message}
              >
                <Input
                  id='password'
                  type='password'
                  placeholder='Entrez le mot de passe'
                  {...form.register('password')}
                />
              </FormField>
                
              <FormField
                name='confirmPassword'
                label='Confirmer le mot de passe'
                error={form.formState.errors.confirmPassword?.message}
              >
                <Input
                  id='confirmPassword'
                  type='password'
                  placeholder='Confirmez le mot de passe'
                  {...form.register('confirmPassword')}
                />
              </FormField>
            </>
          )}
        </>
      )}

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
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
