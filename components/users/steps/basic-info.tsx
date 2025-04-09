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
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { User } from "lucide-react"
import type { UserCreateInput } from "@/types/user"

const formSchema = z.object({
  username: z.string().min(2, "El nombre de usuario debe tener al menos 2 caracteres"),
  email: z.string().email("Debe ser un email válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
})

interface BasicInfoFormProps {
  defaultValues: Partial<UserCreateInput>
  onSubmit: (data: Partial<UserCreateInput>) => void
}

export function BasicInfoForm({ defaultValues, onSubmit }: BasicInfoFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: defaultValues.username || "",
      email: defaultValues.email || "",
      password: defaultValues.password || "",
    },
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex gap-3 items-center mb-2">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <User className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>Información básica</CardTitle>
            <CardDescription>
              Ingrese los datos principales del usuario
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de usuario</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingrese el nombre de usuario" {...field} />
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Ingrese la contraseña" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
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