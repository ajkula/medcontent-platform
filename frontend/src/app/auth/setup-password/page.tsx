'use client';

import { Form, FormField } from '@/components/forms/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SETUP_PASSWORD } from '@/graphql/mutations/auth';
import { VALIDATE_PASSWORD_TOKEN } from '@/graphql/queries/auth';
import { useMutation, useQuery } from '@apollo/client';
import { yupResolver } from '@hookform/resolvers/yup';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

const passwordSchema = yup.object({
  password: yup
    .string()
    .required('Le mot de passe est requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: yup
    .string()
    .required('La confirmation du mot de passe est requise')
    .oneOf([yup.ref('password'), 'Les mots de passe ne correspondent pas'])
});

type PasswordFormValues = yup.InferType<typeof passwordSchema>;

export default function SetupPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PasswordFormValues>({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const { data: tokenData, loading: tokenLoading, error: tokenError } = useQuery(VALIDATE_PASSWORD_TOKEN, {
    variables: { token: token || '' },
    skip: !token,
  });

  const [setupPassword] = useMutation(SETUP_PASSWORD, {
    onCompleted: async (data) => {
      console.log("Mot de passe configuré avec succès:", data);

      // connecter auto avec le JWT
      await signIn('credentials', {
        accessToken: data.setupPassword,
        callbackUrl: '/',
        redirect: false,
      });
      
      // redirect page d'accueil
      router.push('/');
    },
    onError: (error) => {
      console.error("Erreur lors de la configuration du mot de passe:", error);
      setError(`Erreur: ${error.message}`);
      setIsLoading(false);
    },
  });

  useEffect(() => {
    console.log("Token:", token);
    console.log("Token data:", tokenData);
    console.log("Token error:", tokenError);
    if (!token) {
      setError('Token manquant. Veuillez utiliser le lien complet fourni par votre administrateur.');
      return;
    }

    if (tokenError) {
      setError(`Erreur de validation du token: ${tokenError.message}`);
    }

    if (tokenData !== undefined && tokenData.validatePasswordToken === false) {
      setError('Ce lien a expiré ou est invalide. Veuillez demander un nouveau lien à votre administrateur.');
    }
  }, [token, tokenData, tokenError]);

  const onSubmit = async (values: PasswordFormValues) => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      await setupPassword({
        variables: {
          data: {
            token,
            password: values.password,
          },
        },
      });
    } catch (err) {
      // noop
    }
  };

  // loader pendant la verification du token
  if (tokenLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='text-center'>
          <div className='h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600'>Vérification du lien...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex justify-center items-center min-h-screen p-4'>
      <div className='w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-md'>
        <h1 className='text-2x1 font-bold text-center mb-2'>Confirmation de votre mot de passe</h1>
        <p className='text-gray-600 text-center mb-6'>
          Définissez votre mot de passe pour accéder à MedContent Platform.
        </p>
        {error && (
          <div className='p-4 mb-6 text-sm text-red-800 border-red-300 rounded-md bg-red-50'>
            {error}
          </div>
        )}

        {!error && token && tokenData?.validatePasswordToken && (
          <Form form={form} onSubmit={onSubmit} className='space-y-6'>
            <FormField
              name='password'
              label='Mot de passe'
              error={form.formState.errors.password?.message}
            >
              <Input
                id='password'
                type='password'
                placeholder='Votre mot depasse'
                {...form.register('password')}
              />
            </FormField>

            <FormField
              name='confirmPassword'
              label='Confirmation de votre mot de passe'
              error={form.formState.errors.confirmPassword?.message}
            >
              <Input
                id='confirmPassword'
                type='confirmPassword'
                placeholder='Confirmez votre mot de passe'
                {...form.register('confirmPassword')}
              />
            </FormField>

            <Button
              type='submit'
              className='w-full'
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className='mr-2'>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  Configurartion en cours...
                </>
              ) : 'Configurer mon mot de passe'}
            </Button>
          </Form>
        )}

        <p className='text-sm text-gray-500 text-center mt-6'>
          Besoin d'aide? Contactez votre administrateur.
        </p>
      </div>
    </div>
  );
}