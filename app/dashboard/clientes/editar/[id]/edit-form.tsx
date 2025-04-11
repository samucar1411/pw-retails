"use client";

import * as React from "react";

import * as z from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Building2, Contact, User } from "lucide-react";

import { Company } from "@/types/company";
import { useCompany } from "@/context/company-context";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  business_name: z
    .string()
    .min(2, "La razón social debe tener al menos 2 caracteres"),
  identification_number: z
    .string()
    .min(5, "El RUC debe tener al menos 5 caracteres"),
  country: z.string().min(2, "El país es requerido"),
  legal_names: z
    .string()
    .min(2, "Los nombres deben tener al menos 2 caracteres"),
  legal_last_names: z
    .string()
    .min(2, "Los apellidos deben tener al menos 2 caracteres"),
  legal_identification_number: z
    .string()
    .min(5, "El número de documento debe tener al menos 5 caracteres"),
  contact: z
    .string()
    .min(2, "El nombre del contacto debe tener al menos 2 caracteres"),
  email: z.string().email("Debe ser un email válido"),
  emp_qty: z.coerce.number().min(1, "Debe tener al menos 1 empleado"),
  economy_activity: z
    .string()
    .min(2, "La actividad económica debe tener al menos 2 caracteres"),
});

type FormValues = z.infer<typeof formSchema>;

interface EditCompanyFormProps {
  company: Company;
}

export function EditCompanyForm({ company }: EditCompanyFormProps) {
  const router = useRouter();
  const { updateCompany } = useCompany();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: company.name,
      business_name: company.business_name,
      identification_number: company.identification_number,
      country: company.country,
      legal_names: company.legal_names,
      legal_last_names: company.legal_last_names,
      legal_identification_number: company.legal_identification_number,
      contact: company.contact,
      email: company.email,
      emp_qty: company.emp_qty,
      economy_activity: company.economy_activity,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      const updated = await updateCompany(company.id, {
        ...data,
        id: company.id,
        image_url: company.image_url,
      });

      if (updated) {
        toast.success("Empresa actualizada exitosamente");
        router.replace("/dashboard/clientes");
      } else {
        toast.error("Error al actualizar la empresa");
      }
    } catch (error) {
      console.error("Error updating company:", error);
      toast.error("Error al actualizar la empresa");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Editar empresa
            </h1>
            <p className="text-muted-foreground">
              Actualiza la información de la empresa
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info Section */}
          <section className="bg-background rounded-xl p-6 shadow-sm border">
            <div className="flex gap-3 items-center mb-6">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Información básica</h2>
                <p className="text-sm text-muted-foreground">
                  Datos principales de la empresa
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Empresa S.A." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="business_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razón social</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Empresa Sociedad Anónima"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="identification_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RUC</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 80012345-6" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Paraguay" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          {/* Legal Rep Section */}
          <section className="bg-background rounded-xl p-6 shadow-sm border">
            <div className="flex gap-3 items-center mb-6">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Representante legal</h2>
                <p className="text-sm text-muted-foreground">
                  Datos del representante legal
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="legal_names"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombres</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: María Alejandra" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="legal_last_names"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellidos</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: González Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="legal_identification_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Documento de identidad</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: 1234567"
                        {...field}
                        className="[appearance:textfield]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-background rounded-xl p-6 shadow-sm border">
            <div className="flex gap-3 items-center mb-6">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Contact className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  Información de contacto
                </h2>
                <p className="text-sm text-muted-foreground">
                  Datos para comunicación y operaciones
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Persona de contacto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Juan Pérez" {...field} />
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
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: contacto@empresa.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emp_qty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad de empleados</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Ej: 100"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="economy_activity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actividad económica</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Comercio minorista" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
