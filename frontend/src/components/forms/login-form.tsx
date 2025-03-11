'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Form, FormField, FormError } from './form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Schéma de validation
const loginSchema = yup.object({
  email: yup
    .string()
    .email('Adresse email invalide')
    .required('L\'email est requis'),
  password: yup
    .string()
    .required('Le mot de passe est requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginFormValues = yup.InferType<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        setError('Identifiants incorrects. Veuillez réessayer.');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
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

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Connexion en cours...' : 'Se connecter'}
      </Button>
    </Form>
  );
}
