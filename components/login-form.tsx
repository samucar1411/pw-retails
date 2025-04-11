"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "El nombre de usuario debe tener al menos 2 caracteres.",
  }),
  password: z.string().min(6, {
    message: "La contraseña debe tener al menos 6 caracteres.",
  }),
});

export function LoginForm() {
  const { loginWithUserInfo } = useAuth();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await loginWithUserInfo(values.username, values.password);
      toast.success("¡Inicio de sesión exitoso!");
    } catch (err) {
      console.error("Error de inicio de sesión:", err);
      let errorMessage =
        "Error al iniciar sesión. Por favor, verifica tus credenciales.";

      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.detail || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    }
  }

  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          control={form.control}
          name="username"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Nombre de usuario</FormLabel>
              <Input placeholder="Ingrese su nombre de usuario" {...field} />
              {fieldState.error && (
                <FormMessage error={fieldState.error.message} />
              )}
            </FormItem>
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <Input
                type="password"
                placeholder="Ingrese su contraseña"
                {...field}
              />
              {fieldState.error && (
                <FormMessage error={fieldState.error.message} />
              )}
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Iniciando sesión...
            </div>
          ) : (
            "Iniciar sesión"
          )}
        </Button>
      </form>
    </div>
  );
}
