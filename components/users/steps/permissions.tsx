import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Shield } from "lucide-react"
import type { UserCreateInput } from "@/types/user"

const formSchema = z.object({
  is_active: z.boolean(),
  is_staff: z.boolean(),
  is_superuser: z.boolean(),
})

interface PermissionsFormProps {
  defaultValues: Partial<UserCreateInput>
  onSubmit: (data: Partial<UserCreateInput>) => void
  onBack: () => void
}

export function PermissionsForm({ defaultValues, onSubmit, onBack }: PermissionsFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      is_active: defaultValues.is_active ?? true,
      is_staff: defaultValues.is_staff ?? false,
      is_superuser: defaultValues.is_superuser ?? false,
    },
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex gap-3 items-center mb-2">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>Permisos</CardTitle>
            <CardDescription>
              Configure los permisos del usuario
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Usuario activo</FormLabel>
                    <FormDescription>
                      Determina si el usuario puede iniciar sesión
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
              name="is_staff"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Staff</FormLabel>
                    <FormDescription>
                      Acceso al panel de administración
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
              name="is_superuser"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Superusuario</FormLabel>
                    <FormDescription>
                      Acceso total al sistema
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

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={onBack}>
                Anterior
              </Button>
              <Button type="submit">
                Siguiente
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 