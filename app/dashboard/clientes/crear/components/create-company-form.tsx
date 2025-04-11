"use client";

import * as React from "react";
import * as z from "zod";
import Image from "next/image";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Contact,
  User,
  ImagePlus,
  X,
  ArrowLeft,
} from "lucide-react";

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
  FormDescription,
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  logo: z
    .any()
    .optional()
    .refine((file) => {
      if (!file) return true;
      return file instanceof File;
    }, "Must be a valid file"),
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

export function CreateCompanyForm() {
  const router = useRouter();
  const { createCompany } = useCompany();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      logo: undefined,
      name: "",
      business_name: "",
      identification_number: "",
      country: "",
      legal_names: "",
      legal_last_names: "",
      legal_identification_number: "",
      contact: "",
      email: "",
      emp_qty: 1,
      economy_activity: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Add all text fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "logo" && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      // Add logo if present
      if (data.logo) {
        formData.append("image", data.logo);
      }

      await createCompany(formData);
      toast.success("Empresa creada exitosamente", {
        description: "La nueva empresa ha sido registrada en el sistema",
      });
      router.push("/dashboard/clientes");
    } catch (error: unknown) {
      console.log("Error details:", {
        name: error instanceof Error ? error.name : "Unknown error",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      toast.error("Error al crear la empresa", {
        description: "Por favor verifique los datos e intente nuevamente",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-5 lg:px-24 lg:py-10 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Button>
      <div className="flex-col items-center gap-2">
        <h1 className="text-3xl font-bold">Nueva Empresa</h1>
        <span className="text-muted-foreground">
          Datos legales y principales de la organización
        </span>
      </div>
      <Progress className="h-2" />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 pb-24"
        >
          <section className="bg-background rounded-xl p-6 shadow-sm border">
            <div className="flex gap-3 items-center mb-6">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  Información de la empresa
                </h2>
                <p className="text-sm text-muted-foreground">
                  Datos legales y principales de la organización
                </p>
              </div>
            </div>

            <div className="mb-6">
              <FormField
                control={form.control}
                name="logo"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Logo de la empresa</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        {value ? (
                          <div className="relative w-24 h-24 border rounded-lg overflow-hidden">
                            <Image
                              src={URL.createObjectURL(value)}
                              alt="Logo preview"
                              className="object-contain"
                              fill
                              sizes="96px"
                            />
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => onChange(undefined)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  onChange(undefined);
                                }
                              }}
                              className="absolute top-1 right-1 p-1 bg-background/80 rounded-full hover:bg-background cursor-pointer"
                            >
                              <X className="h-4 w-4" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors cursor-pointer">
                            <label
                              htmlFor="logo-upload"
                              className="cursor-pointer p-4"
                            >
                              <ImagePlus className="h-8 w-8 mx-auto mb-2" />
                              <span className="text-xs text-center block">
                                Subir logo
                              </span>
                            </label>
                          </div>
                        )}
                        <Input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                toast.error("El archivo es demasiado grande", {
                                  description:
                                    "El tamaño máximo permitido es 2MB",
                                });
                                return;
                              }
                              if (!file.type.startsWith("image/")) {
                                toast.error("Formato no válido", {
                                  description:
                                    "Por favor sube una imagen (PNG, JPG)",
                                });
                                return;
                              }
                              onChange(file);
                            }
                          }}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Sube el logo de la empresa (PNG, JPG, máximo 2MB)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre comercial</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Tech Solutions S.A." {...field} />
                    </FormControl>
                    <FormDescription>
                      Nombre con el que se conoce a la empresa
                    </FormDescription>
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
                        placeholder="Ej: Tech Solutions Sociedad Anónima"
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
                      <Input placeholder="Ej: 80012345-0" {...field} />
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
                    <FormLabel>País de operación</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Paraguay" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          <section className="bg-background rounded-xl p-6 shadow-sm border">
            <div className="flex gap-3 items-center mb-6">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Representante legal</h2>
                <p className="text-sm text-muted-foreground">
                  Datos del representante legal de la empresa
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
                      <Input placeholder="Ej: Juan Carlos" {...field} />
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
                      <Input placeholder="Ej: Pérez García" {...field} />
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
                      <Input placeholder="Ej: 12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

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
                  Datos de contacto y actividad de la empresa
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
                      <Input placeholder="Ej: María López" {...field} />
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
                        type="email"
                        placeholder="Ej: contacto@empresa.com"
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
                        placeholder="Ej: 50"
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
                      <Input
                        placeholder="Ej: Desarrollo de software"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
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
                onClick={() => router.push("/dashboard/clientes")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                Crear empresa
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
