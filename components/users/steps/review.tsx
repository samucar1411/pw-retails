import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ClipboardCheck } from "lucide-react"
import type { UserCreateInput } from "@/types/user"

interface ReviewFormProps {
  data: Partial<UserCreateInput>
  onSubmit: () => void
  onBack: () => void
}

export function ReviewForm({ data, onSubmit, onBack }: ReviewFormProps) {
  const sections = [
    {
      title: "Información básica",
      fields: [
        { label: "Nombre de usuario", value: data.username },
        { label: "Email", value: data.email },
      ],
    },
    {
      title: "Información personal",
      fields: [
        { label: "Nombre", value: data.first_name },
        { label: "Apellido", value: data.last_name },
      ],
    },
    {
      title: "Permisos",
      fields: [
        { label: "Usuario activo", value: data.is_active ? "Sí" : "No" },
        { label: "Staff", value: data.is_staff ? "Sí" : "No" },
        { label: "Superusuario", value: data.is_superuser ? "Sí" : "No" },
      ],
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex gap-3 items-center mb-2">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>Revisar información</CardTitle>
            <CardDescription>
              Verifique los datos antes de crear el usuario
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h3 className="font-medium text-lg">{section.title}</h3>
              <div className="rounded-lg border divide-y">
                {section.fields.map((field) => (
                  <div
                    key={field.label}
                    className="flex justify-between py-2 px-4"
                  >
                    <span className="text-sm text-muted-foreground">
                      {field.label}
                    </span>
                    <span className="text-sm font-medium">{field.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={onBack}>
              Anterior
            </Button>
            <Button onClick={onSubmit}>
              Crear usuario
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 