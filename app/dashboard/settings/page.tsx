"use client";

import { useEffect, useState, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const generalFormSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  marketing_emails: z.boolean(),
  security_emails: z.boolean(),
});

type GeneralFormValues = z.infer<typeof generalFormSchema>;

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const form = useForm<GeneralFormValues>({
    resolver: zodResolver(generalFormSchema),
    defaultValues: {
      name: "",
      email: "",
      marketing_emails: false,
      security_emails: true,
    },
  });

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      form.reset({
        name: "John Doe",
        email: "john@example.com",
        marketing_emails: true,
        security_emails: true,
      });
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Error al cargar la configuración");
    } finally {
      setLoading(false);
    }
  }, [form]);

  const onSubmit = async (formData: GeneralFormValues) => {
    try {
      // TODO: Replace with actual API call
      console.log(formData);
      toast.success("Configuración actualizada exitosamente");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Error al guardar la configuración");
    }
  };

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Configuración general</h3>
        <p className="text-sm text-muted-foreground">
          Configura las preferencias generales de tu cuenta
        </p>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Tu nombre" {...field} />
                </FormControl>
                <FormDescription>
                  Este es el nombre que se mostrará en tu perfil
                </FormDescription>
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
                  <Input placeholder="tu@email.com" type="email" {...field} />
                </FormControl>
                <FormDescription>
                  Este es el email que se usará para las notificaciones
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="marketing_emails"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Emails de marketing
                  </FormLabel>
                  <FormDescription>
                    Recibe emails sobre nuevas características y actualizaciones
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
            name="security_emails"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Emails de seguridad
                  </FormLabel>
                  <FormDescription>
                    Recibe emails sobre la actividad de tu cuenta
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit">Guardar cambios</Button>
        </form>
      </Form>
    </div>
  );
}
