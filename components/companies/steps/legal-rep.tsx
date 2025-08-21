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
  legal_names: z
    .string()
    .min(2, "Los nombres deben tener al menos 2 caracteres"),
  legal_last_names: z
    .string()
    .min(2, "Los apellidos deben tener al menos 2 caracteres"),
  legal_identification_number: z
    .string()
    .min(5, "El número de documento debe tener al menos 5 caracteres"),
});

interface LegalRepFormProps {
  defaultValues: Partial<CompanyCreateInput>;
  onSubmit: (data: Partial<CompanyCreateInput>) => void;
  onBack: () => void;
}

export function LegalRepForm({
  defaultValues,
  onSubmit,
  onBack,
}: LegalRepFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      legal_names: defaultValues.legal_names || "",
      legal_last_names: defaultValues.legal_last_names || "",
      legal_identification_number:
        defaultValues.legal_identification_number || "",
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit({
      legal_names: data.legal_names,
      legal_last_names: data.legal_last_names,
      legal_identification_number: data.legal_identification_number,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="legal_names"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombres</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nombres del representante" />
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
                <Input {...field} placeholder="Apellidos del representante" />
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
              <FormLabel>Identificación</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Número de identificación" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Atrás
          </Button>
          <Button type="submit">Siguiente</Button>
        </div>
      </form>
    </Form>
  );
}
