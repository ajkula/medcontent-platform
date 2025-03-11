import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Obtenir le token depuis la session
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  // Définir les chemins qui ne nécessitent pas d'authentification
  const publicPaths = ['/auth/login', '/auth/register', '/auth/error'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Si le chemin est public, permettre l'accès
  if (isPublicPath) {
    console.log(1, 'IS PUBLIC');
    return NextResponse.next();
  }

  // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une page protégée
  if (!token) {
    // Rediriger vers la page de connexion avec le callback URL
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    
    console.log(2, 'UNAUTH', url);
    return NextResponse.redirect(url);
  }

  console.log(3, 'IS AUTH');
  // Si l'utilisateur est authentifié, permettre l'accès
  return NextResponse.next();
}

// Configurer les chemins sur lesquels le middleware doit s'exécuter
export const config = {
  matcher: [
    // Protéger toutes les routes sauf les chemins publics
    '/((?!auth/login|auth/register|auth/error|api|_next/static|_next/image|favicon.ico).*)',
  ],
};