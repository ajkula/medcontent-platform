'use client';

import { RegisterForm } from '@/components/forms/register-form';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Inscription</h1>
      
      <RegisterForm />
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Vous avez déjà un compte ?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}
