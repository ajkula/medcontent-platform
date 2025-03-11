import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { client } from "./apollo-client";
import { gql } from "@apollo/client";

// Définition de la mutation de connexion (login)
const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      accessToken
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Appel à l'API GraphQL pour authentifier l'utilisateur
          const { data } = await client.mutate({
            mutation: LOGIN_MUTATION,
            variables: {
              loginInput: {
                email: credentials.email,
                password: credentials.password,
              },
            },
          });

          if (data?.login?.accessToken) {
            // Retourne les données de l'utilisateur avec le token d'accès
            return {
              id: data.login.user.id,
              name: data.login.user.name,
              email: data.login.user.email,
              role: data.login.user.role,
              accessToken: data.login.accessToken,
            };
          }
          
          return null;
        } catch (error) {
          console.error("Erreur d'authentification:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Inclut les données utilisateur dans le token JWT
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      // Inclut les données utilisateur dans la session
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  secret: process.env.NEXTAUTH_SECRET,
};