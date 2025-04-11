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
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  business_name: z
    .string()
    .min(2, "La razón social debe tener al menos 2 caracteres"),
  identification_number: z
    .string()
    .min(5, "El RUC debe tener al menos 5 caracteres"),
  country: z.string().min(2, "El país es requerido"),
});

interface BasicInfoFormProps {
  defaultValues: Partial<CompanyCreateInput>;
  onSubmit: (data: Partial<CompanyCreateInput>) => void;
}

export function BasicInfoForm({ defaultValues, onSubmit }: BasicInfoFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues.name || "",
      business_name: defaultValues.business_name || "",
      identification_number: defaultValues.identification_number || "",
      country: defaultValues.country || "",
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit({
      name: data.name,
      business_name: data.business_name,
      identification_number: data.identification_number,
      country: data.country,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la empresa</FormLabel>
              <FormControl>
                <Input placeholder="Ingrese el nombre" {...field} />
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
                <Input placeholder="Ingrese la razón social" {...field} />
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
                <Input placeholder="Ingrese el RUC" {...field} />
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
                <Input placeholder="Ingrese el país" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">Siguiente</Button>
        </div>
      </form>
    </Form>
  );
}
