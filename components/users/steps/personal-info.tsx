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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Contact } from "lucide-react";
import type { UserCreateInput } from "@/types/user";

const formSchema = z.object({
  first_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  last_name: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
});

interface PersonalInfoFormProps {
  defaultValues: Partial<UserCreateInput>;
  onSubmit: (data: Partial<UserCreateInput>) => void;
  onBack: () => void;
}

export function PersonalInfoForm({
  defaultValues,
  onSubmit,
  onBack,
}: PersonalInfoFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: defaultValues.first_name || "",
      last_name: defaultValues.last_name || "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex gap-3 items-center mb-2">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <Contact className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>Información personal</CardTitle>
            <CardDescription>
              Ingrese los datos personales del usuario
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={onBack}>
                Anterior
              </Button>
              <Button type="submit">Siguiente</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
