'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { use } from "react";


export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Utilisateurs</h1>
      <Card>
        <CardHeader>
          <CardTitle>Utilisateur</CardTitle>
        </CardHeader>
        <CardContent>
          {id}
          {session && JSON.stringify(session)}
        </CardContent>
      </Card>
    </div>);
}