"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UserCircle, Clock, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "visor-ui";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { DeleteUserModal } from "./delete-user-modal";
import type { User } from "@/types/user";
import { userService } from "@/services/user-service";
import { toast } from "sonner";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "user",
    header: "Usuario",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              <UserCircle className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {user.first_name} {user.last_name}
            </div>
            <div className="text-sm text-muted-foreground">
              @{user.username}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ row }) => {
      const user = row.original;
      let variant:
        | "default"
        | "secondary"
        | "destructive"
        | "outline"
        | "success" = "secondary";
      let text = "Usuario";

      if (user.is_superuser) {
        variant = "default";
        text = "Superusuario";
      } else if (user.is_staff) {
        variant = "outline";
        text = "Staff";
      }

      return <Badge variant={variant}>{text}</Badge>;
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => (
      <span
        className={row.original.is_active ? "text-primary" : "text-destructive"}
      >
        {row.original.is_active ? "Activo" : "Inactivo"}
      </span>
    ),
  },
  {
    accessorKey: "activity",
    header: "Actividad",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Registrado: {new Date(user.date_joined).toLocaleDateString("es")}
            </span>
          </div>
          {user.last_login && (
            <div className="text-sm text-muted-foreground">
              Último acceso:{" "}
              {new Date(user.last_login).toLocaleDateString("es")}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "permissions",
    header: "Permisos",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="space-y-1">
          <div className="text-sm">Grupos: {user.groups.length}</div>
          <div className="text-sm text-muted-foreground">
            Permisos: {user.user_permissions.length}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Correo",
    cell: ({ row }) => row.original.email,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const ActionCell = () => {
        const router = useRouter();
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/dashboard/usuarios/editar/${row.original.id}`)
                }
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  const event = new CustomEvent("deleteUser", {
                    detail: row.original,
                  });
                  window.dispatchEvent(event);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      };
      return <ActionCell />;
    },
  },
];

export function UserActions() {
  const router = useRouter();
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleDelete = async (userId: number) => {
    try {
      await userService.deleteUser(userId);
      toast.success("Usuario eliminado exitosamente");
      router.refresh();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
      toast.error("Error al eliminar el usuario");
    }
  };

  useEffect(() => {
    const onDeleteUser = (e: CustomEvent<User>) => {
      setUserToDelete(e.detail);
    };

    window.addEventListener("deleteUser", onDeleteUser as EventListener);
    return () => {
      window.removeEventListener("deleteUser", onDeleteUser as EventListener);
    };
  }, []);

  return (
    <DeleteUserModal
      user={userToDelete}
      onClose={() => setUserToDelete(null)}
      onConfirm={(userId) => {
        handleDelete(userId);
        setUserToDelete(null);
      }}
    />
  );
}
