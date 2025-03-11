import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { getSession } from 'next-auth/react';

// Création du lien HTTP de base
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || '/api/graphql',
});

// Gestion des erreurs
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    );
  if (networkError) console.error(`[Network error]: ${networkError}`);
});

// Ajout du token d'authentification aux en-têtes
const authLink = setContext(async (_, { headers }) => {
  // Récupération de la session depuis NextAuth
  const session = await getSession();
  
  // Vérifiez ce que contient la session pour le débogage
  console.log('Session dans Apollo Client:', session);
  
  // Importante modification ici: s'assurer que nous accédons correctement au token
  const token = session?.accessToken || '';
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Création du client Apollo
export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});