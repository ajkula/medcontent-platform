'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  let errorMessage = 'Une erreur est survenue lors de l\'authentification.';
  
  // Personnalisation des messages d'erreur
  switch (error) {
    case 'CredentialsSignin':
      errorMessage = 'Identifiants incorrects. Veuillez réessayer.';
      break;
    case 'SessionRequired':
      errorMessage = 'Vous devez être connecté pour accéder à cette page.';
      break;
    case 'AccessDenied':
      errorMessage = 'Vous n\'avez pas les droits nécessaires pour accéder à cette page.';
      break;
    default:
      errorMessage = 'Une erreur inattendue est survenue. Veuillez réessayer.';
  }

  return (
    <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
      <h1 className="text-2xl font-bold mb-6 text-center text-red-600">Erreur d'authentification</h1>
      
      <div className="mb-6 p-4 text-sm text-red-800 bg-red-50 rounded-md">
        {errorMessage}
      </div>
      
      <div className="flex justify-center space-x-4">
        <Link href="/auth/login">
          <Button>Retour à la connexion</Button>
        </Link>
      </div>
    </div>
  );
}
