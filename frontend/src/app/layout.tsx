import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ApolloWrapper from '@/lib/apollo-wrapper';
import AuthProvider from '@/lib/auth-provider';

// Définition de la police avec la configuration correcte
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'MedContent Platform',
  description: 'Plateforme de gestion de contenu médical',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.className}>
      <body>
        <AuthProvider>
          <ApolloWrapper>
            {children}
          </ApolloWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}