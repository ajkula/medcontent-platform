'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { USERS_QUERY } from "@/graphql/queries/users";
import { USER_FIELDS_LABELS, USER_ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { User, UserRole } from "@/types/generated/graphql";
import { useQuery } from "@apollo/client";
import { Button } from '@/components/ui/button';
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";


export default function UsersPage() {
  const { data: session } = useSession();
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [searchTerm, setSearchTerm] = useState('');

  // Récupération des utilisateurs avec filtres
  const { data, loading, refetch } = useQuery(USERS_QUERY, {
    variables: {
      searchTerm: searchTerm || undefined,
      role: roleFilter || undefined,
    },
  });

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.READER:
        return 'secondary';
      case UserRole.REVIEWER:
        return 'info';
      case UserRole.EDITOR:
        return 'destructive';
      case UserRole.ADMIN:
        return 'success';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return USER_ROLE_LABELS.admin;
      case UserRole.EDITOR:
        return USER_ROLE_LABELS.editor;
      case UserRole.REVIEWER:
        return USER_ROLE_LABELS.reviewer;
      case UserRole.READER:
        return USER_ROLE_LABELS.reader;
      default:
        return role;
    }
  }

  const filteredUsers = data?.users || [];
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch({
      role: roleFilter || undefined,
      searchTerm: searchTerm || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <Link href="/users/create">
          <Button>Nouvel utilisateur</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <form onSubmit={handleSearch} className="flex gap-4">
              <Input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
              <Button type="submit">Rechercher</Button>
            </form>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={roleFilter === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter('')}
              >
                Tous
              </Button>
              {Object.values(UserRole).map((role) => (
                <Button
                  key={role}
                  variant={roleFilter === role ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRoleFilter(role)}
                >
                  {getRoleLabel(role)}
                </Button>
              ))}
            </div>
          </div>

          {(viewMode ===  'table') && <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{USER_FIELDS_LABELS.name}</TableHead>
                <TableHead>{USER_FIELDS_LABELS.email}</TableHead>
                <TableHead>{USER_FIELDS_LABELS.role}</TableHead>
                <TableHead>{USER_FIELDS_LABELS.createdAt}</TableHead>
                <TableHead>{USER_FIELDS_LABELS.updatedAt}</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-gray-500">Chargement des utilisateurs...</p>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                    {'Aucun utilisateur'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>{formatDate(user.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/users/${user.id}`}>
                          <Button variant="outline" size="sm">
                            Voir
                          </Button>
                        </Link>
                        <Link href={`/users/${user.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            Modifier
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>}
          {viewMode === "cards" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user: User) => (
                <div key={user.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{user.name}</h3>
                      <p className="text-gray-500">{user.email}</p>
                    </div>
                    <Badge variant={
                      user.role === UserRole.ADMIN ? 'destructive' :
                      user.role === UserRole.EDITOR ? 'default' :
                      'secondary'
                    }>{user.role}</Badge>
                  </div>
                  <div>
                    Membre depuis {formatDate(user.createdAt)}
                  </div>
                  <div >

                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}