"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2, PencilIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { userAdminService } from "@/services/user-admin-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getSafeImageUrl } from "@/lib/utils";

interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  is_active: boolean;
  role: string;
  contact: string | null;
  job_position: string;
  avatar_url?: string;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    is_active: true,
    role: "user",
    contact: "",
    job_position: "",
    avatar_url: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await userAdminService.getUserAdmin(Number(params.id));
        setFormData({
          first_name: response.user.first_name,
          last_name: response.user.last_name,
          email: response.user.email,
          username: response.user.username,
          is_active: response.user.is_active,
          role: response.role,
          contact: response.contact || "",
          job_position: response.job_position,
        });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
        toast.error("Error al cargar los datos del usuario");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await userAdminService.updateUserAdmin(Number(params.id), {
        user: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          username: formData.username,
          is_active: formData.is_active,
        },
        role: formData.role,
        contact: formData.contact,
        job_position: formData.job_position,
      });
      toast.success("Información del usuario actualizada correctamente");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
      toast.error("Error al actualizar el usuario");
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = () => {
    // TODO: Implement image upload functionality
    toast.info("Funcionalidad de cambio de imagen próximamente");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Detalles del Usuario
            </h1>
            <p className="text-muted-foreground">
              Ver y editar información del usuario
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Perfil</CardTitle>
          <CardDescription>
            Actualizar la información del usuario y sus permisos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={getSafeImageUrl(formData.avatar_url)} />
                  <AvatarFallback>
                    {formData.first_name?.[0]}
                    {formData.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  onClick={handleImageChange}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-medium">
                  {formData.first_name} {formData.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  @{formData.username}
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="first_name">Nombre</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Apellido</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="user">Usuario</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job_position">Cargo</Label>
                <Input
                  id="job_position"
                  value={formData.job_position}
                  onChange={(e) =>
                    setFormData({ ...formData, job_position: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contacto</Label>
                <Input
                  id="contact"
                  value={formData.contact || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, contact: e.target.value })
                  }
                  placeholder="Número de teléfono o información de contacto"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label htmlFor="is_active">Usuario activo</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
