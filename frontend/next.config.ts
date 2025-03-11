/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'], // Ajoutez ici les domaines pour les images hébergées
  },
  // Si vous avez besoin de configuration spécifique pour l'API GraphQL
  async rewrites() {
    return [
      {
        source: '/api/graphql',
        destination: process.env.GRAPHQL_URL || 'http://localhost:3001/graphql',
      },
    ];
  },
}

module.exports = nextConfig;
