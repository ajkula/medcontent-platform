'use client';

import { LoginForm } from '@/components/forms/login-form';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');
  const error = searchParams.get('error');
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  return (
    <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Connexion</h1>
      
      {registered && (
        <div className="mb-4 p-4 text-sm text-green-800 bg-green-50 rounded-md">
          Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 text-sm text-red-800 bg-red-50 rounded-md">
          {error === 'CredentialsSignin' 
            ? 'Identifiants incorrects. Veuillez réessayer.' 
            : 'Une erreur est survenue. Veuillez réessayer.'}
        </div>
      )}
      
      <LoginForm />
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Vous n'avez pas de compte ?{' '}
          <Link href="/auth/register" className="text-blue-600 hover:underline font-medium">
            Inscrivez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}
