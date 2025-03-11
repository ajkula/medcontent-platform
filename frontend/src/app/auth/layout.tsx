import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Bannière latérale */}
      <div className="hidden lg:block relative w-1/2 bg-blue-600">
        <div className="absolute inset-0 flex items-center justify-center p-12 text-white">
          <div className="max-w-md space-y-6">
            <h1 className="text-4xl font-bold">MedContent Platform</h1>
            <p className="text-xl">
              Créez, gérez et partagez du contenu médical de qualité avec un suivi complet des modifications.
            </p>
          </div>
        </div>
      </div>
      
      {/* Formulaire d'authentification */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 p-6 sm:p-12">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <h2 className="text-3xl font-bold text-blue-600">MedContent</h2>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
