"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, User, Contact, Shield, Plus } from "lucide-react";

import { userService } from "@/services/user-service";
import type { UserCreateInput } from "@/types/user";

const formSchema = z.object({
  // Basic Info
  username: z
    .string()
    .min(2, "El nombre de usuario debe tener al menos 2 caracteres"),
  email: z.string().email("Debe ser un email válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),

  // Personal Info
  first_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  last_name: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),

  // Permissions
  is_active: z.boolean(),
  is_staff: z.boolean(),
  is_superuser: z.boolean(),
});

export default function CreateUserPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      is_active: true,
      is_staff: false,
      is_superuser: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await userService.createUser(data as UserCreateInput);
      toast.success("Usuario creado exitosamente", {
        description: "El nuevo usuario ha sido registrado en el sistema",
      });
      router.push("/dashboard/usuarios");
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Error al crear el usuario", {
        description: "Por favor verifique los datos e intente nuevamente",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-3/4 mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Plus className="h-6 w-6" />
            Nuevo Usuario
          </h1>
          <p className="text-muted-foreground">
            Complete todos los campos requeridos para crear un nuevo usuario
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 pb-24"
        >
          {/* Basic Info Section */}
          <section className="bg-background rounded-xl p-6 shadow-sm border">
            <div className="flex gap-3 items-center mb-6">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Información básica</h2>
                <p className="text-sm text-muted-foreground">
                  Datos principales de la cuenta
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de usuario</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ingrese el nombre de usuario"
                        {...field}
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Ingrese el email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Ingrese la contraseña"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          {/* Personal Info Section */}
          <section className="bg-background rounded-xl p-6 shadow-sm border">
            <div className="flex gap-3 items-center mb-6">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Contact className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Información personal</h2>
                <p className="text-sm text-muted-foreground">
                  Datos personales del usuario
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese el nombre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese el apellido" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          {/* Permissions Section */}
          <section className="bg-background rounded-xl p-6 shadow-sm border">
            <div className="flex gap-3 items-center mb-6">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Permisos</h2>
                <p className="text-sm text-muted-foreground">
                  Configure los permisos del usuario
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Usuario activo
                      </FormLabel>
                      <FormDescription>
                        Determina si el usuario puede iniciar sesión
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_staff"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Staff</FormLabel>
                      <FormDescription>
                        Acceso al panel de administración
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_superuser"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Superusuario</FormLabel>
                      <FormDescription>Acceso total al sistema</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </section>

          <div className="fixed bottom-0 right-0 py-4 px-6 bg-background/80 backdrop-blur-sm border-t z-40 ml-[calc(var(--sidebar-width))] w-[calc(100%-var(--sidebar-width))] data-[state=collapsed]:ml-[calc(var(--sidebar-width-icon))] data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon))]">
            <div className="w-full max-w-3xl mx-auto flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                Crear usuario
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
