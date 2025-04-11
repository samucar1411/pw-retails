"use client";

import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { useUsers } from "@/context/user-context";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserActions } from "./columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function UsersPage() {
  const router = useRouter();
  const { state } = useUsers();

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Usuarios</CardTitle>
            <div className="flex items-center gap-4">
              <Input placeholder="Buscar usuarios..." className="w-[300px]" />

              <Button onClick={() => router.push("/dashboard/usuarios/crear")}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo usuario
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {state.loading ? (
            <div className="text-center">Cargando usuarios...</div>
          ) : state.error ? (
            <div className="text-center text-red-500">{state.error}</div>
          ) : state.users ? (
            <>
              <DataTable columns={columns} data={state.users} />
              <UserActions />
            </>
          ) : (
            <div className="text-center">No hay usuarios disponibles</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
