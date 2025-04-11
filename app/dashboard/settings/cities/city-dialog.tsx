"use client";

import { useEffect } from "react";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { City, CityCreateInput } from "@/types/city";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  Code: z.string().min(2, "El código debe tener al menos 2 caracteres"),
  Name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  Country: z.string().min(2, "El país debe tener al menos 2 caracteres"),
  Closed: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface CityDialogProps {
  city?: City;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CityCreateInput) => Promise<void>;
}

export function CityDialog({
  city,
  open,
  onOpenChange,
  onSubmit,
}: CityDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Code: "",
      Name: "",
      Country: "",
      Closed: false,
    },
  });

  useEffect(() => {
    if (city) {
      form.reset({
        Code: city.Code,
        Name: city.Name,
        Country: city.Country,
        Closed: city.Closed || false,
      });
    } else {
      form.reset({
        Code: "",
        Name: "",
        Country: "",
        Closed: false,
      });
    }
  }, [city, form]);

  const handleSubmit = async (data: FormValues) => {
    await onSubmit(data);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{city ? "Editar ciudad" : "Crear ciudad"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="Code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: ASU" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Asunción" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Country"
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
            <FormField
              control={form.control}
              name="Closed"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Inactivo</FormLabel>
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
            <div className="flex justify-end">
              <Button type="submit">
                {city ? "Guardar cambios" : "Crear ciudad"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
