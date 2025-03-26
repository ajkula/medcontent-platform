'use client';

import { UserForm } from '@/components/forms/user-form'
import { UserRole } from '@/types/generated/graphql';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CreateUserPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      const userRole = session?.user.role;
      if (userRole !== UserRole.ADMIN) {
        router.push('/dashboard');
      }
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <div className='u-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
            <p className='text-gray-600'>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <h1 className='text-2x1 font-bold'>Créer un nouvel utilisateur</h1>
      <UserForm />
    </div>
  );
}