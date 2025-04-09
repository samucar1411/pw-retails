import * as React from "react"
import { Button } from "@/components/ui/button"
import { CompanyCreateInput } from "@/types/company"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ReviewFormProps {
  data: Partial<CompanyCreateInput>
  onSubmit: () => void
  onBack: () => void
}

export function ReviewForm({ data, onSubmit, onBack }: ReviewFormProps) {
  const sections = [
    {
      title: "Información básica",
      fields: [
        { label: "Nombre", value: data.name },
        { label: "Razón social", value: data.business_name },
        { label: "RUC", value: data.identification_number },
        { label: "País", value: data.country },
      ],
    },
    {
      title: "Representante legal",
      fields: [
        { label: "Nombres", value: data.legal_names },
        { label: "Apellidos", value: data.legal_last_names },
        { label: "Documento", value: data.legal_identification_number },
      ],
    },
    {
      title: "Información de contacto",
      fields: [
        { label: "Contacto", value: data.contact },
        { label: "Email", value: data.email },
        { label: "Empleados", value: data.emp_qty },
        { label: "Actividad económica", value: data.economy_activity },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle className="text-lg">{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {section.fields.map((field) => (
              <div key={field.label} className="flex justify-between">
                <span className="text-sm text-muted-foreground">{field.label}</span>
                <span className="text-sm font-medium">{field.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Anterior
        </Button>
        <Button onClick={onSubmit}>
          Crear empresa
        </Button>
      </div>
    </div>
  )
} 