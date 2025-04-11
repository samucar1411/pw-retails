"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Currency } from "@/types/currency";

const formSchema = z.object({
  Code: z.string().min(2, "El código debe tener al menos 2 caracteres"),
  Alias: z.string().min(2, "El alias debe tener al menos 2 caracteres"),
  RoundOff: z.coerce.number().nullable(),
  ConvertionBase: z.coerce.number().nullable(),
  ConvertionDirection: z.string().nullable(),
  FrFactor: z.coerce.number().nullable(),
  ToFactor: z.coerce.number().nullable(),
  Closed: z.boolean().default(false),
});

interface CurrencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency?: Currency;
  onSubmit: (data: z.infer<typeof formSchema>) => Promise<void>;
}

export function CurrencyDialog({
  open,
  onOpenChange,
  currency,
  onSubmit,
}: CurrencyDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Code: currency?.Code || "",
      Alias: currency?.Alias || "",
      RoundOff: currency?.RoundOff || null,
      ConvertionBase: currency?.ConvertionBase || null,
      ConvertionDirection: currency?.ConvertionDirection || null,
      FrFactor: currency?.FrFactor || null,
      ToFactor: currency?.ToFactor || null,
      Closed: currency?.Closed || false,
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting currency:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {currency ? "Editar moneda" : "Nueva moneda"}
          </DialogTitle>
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
                    <Input placeholder="Ej: USD" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Alias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alias</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Dólar americano" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="RoundOff"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Redondeo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ConvertionBase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base de conversión</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="FrFactor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Factor desde</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ToFactor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Factor hasta</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="Closed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>Inactivo</FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
