'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { USERS_QUERY } from "@/graphql/queries/users";
import { useQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import { useState } from "react";


export default function UsersPage() {
  const { data: session } = useSession();
  const [emailFilter, setEmailFilter] = useState<string>('');
  const [nameFilter, setNameFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');

  // Récupération des utilisateurs avec filtres
  const { data, loading, refetch } = useQuery(USERS_QUERY, {
    variables: {
      email: emailFilter || undefined,
      name: nameFilter || undefined,
      role: roleFilter || undefined,
    },
  });

  const users = data?.users || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Utilisateurs</h1>

      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? "Chargement en cours" : JSON.stringify(users)}
        </CardContent>
      </Card>
    </div>
  );
}