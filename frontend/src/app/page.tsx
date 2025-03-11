import { redirect } from 'next/navigation';

export default function Home() {
  // Redirection vers la page d'authentification
  redirect('/auth/login');
}
