import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CompanyCreateInput } from "@/types/company";

const formSchema = z.object({
  contact: z
    .string()
    .min(2, "El nombre del contacto debe tener al menos 2 caracteres"),
  email: z.string().email("Debe ser un email válido"),
  emp_qty: z.coerce.number().min(1, "Debe tener al menos 1 empleado"),
  economy_activity: z
    .string()
    .min(2, "La actividad económica debe tener al menos 2 caracteres"),
});

interface ContactInfoFormProps {
  defaultValues: Partial<CompanyCreateInput>;
  onSubmit: (data: Partial<CompanyCreateInput>) => void;
  onBack: () => void;
}

export function ContactInfoForm({
  defaultValues,
  onSubmit,
  onBack,
}: ContactInfoFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del contacto</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ingrese el nombre del contacto"
                  {...field}
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
                <Input type="email" placeholder="Ingrese el email" {...field} />
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
                  placeholder="Ingrese la cantidad de empleados"
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
                  placeholder="Ingrese la actividad económica"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Anterior
          </Button>
          <Button type="submit">Siguiente</Button>
        </div>
      </form>
    </Form>
  );
}
