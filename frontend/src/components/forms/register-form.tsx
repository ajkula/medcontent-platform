'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@apollo/client';
import { SIGNUP_MUTATION } from '@/graphql/mutations/auth';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, FormField, FormError } from './form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Schéma de validation
const registerSchema = yup.object({
  name: yup
    .string()
    .required('Le nom est requis'),
  email: yup
    .string()
    .email('Adresse email invalide')
    .required('L\'email est requis'),
  password: yup
    .string()
    .required('Le mot de passe est requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Les mots de passe ne correspondent pas')
    .required('Veuillez confirmer votre mot de passe'),
});

type RegisterFormValues = yup.InferType<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  const [signup, { loading }] = useMutation(SIGNUP_MUTATION, {
    onError: (error) => {
      setError(error.message || 'Une erreur est survenue lors de l\'inscription');
    },
    onCompleted: () => {
      router.push('/auth/login?registered=true');
    },
  });

  const form = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setError(null);
    
    try {
      await signup({
        variables: {
          signupInput: {
            name: values.name,
            email: values.email,
            password: values.password,
            role: 'READER', // Rôle par défaut
          },
        },
      });
    } catch (err) {
      // L'erreur est déjà gérée par onError du useMutation
    }
  };

  return (
    <Form form={form} onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="p-4 text-sm text-red-800 border border-red-300 rounded-md bg-red-50">
          {error}
        </div>
      )}

      <FormField
        name="name"
        label="Nom complet"
        error={form.formState.errors.name?.message}
      >
        <Input
          id="name"
          type="text"
          placeholder="Jean Dupont"
          {...form.register('name')}
        />
      </FormField>

      <FormField
        name="email"
        label="Adresse email"
        error={form.formState.errors.email?.message}
      >
        <Input
          id="email"
          type="email"
          placeholder="exemple@domaine.com"
          {...form.register('email')}
        />
      </FormField>

      <FormField
        name="password"
        label="Mot de passe"
        error={form.formState.errors.password?.message}
      >
        <Input
          id="password"
          type="password"
          {...form.register('password')}
        />
      </FormField>

      <FormField
        name="confirmPassword"
        label="Confirmer le mot de passe"
        error={form.formState.errors.confirmPassword?.message}
      >
        <Input
          id="confirmPassword"
          type="password"
          {...form.register('confirmPassword')}
        />
      </FormField>

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? 'Inscription en cours...' : 'S\'inscrire'}
      </Button>
    </Form>
  );
}
