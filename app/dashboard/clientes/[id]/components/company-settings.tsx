"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Company } from "@/types/company";

interface CompanySettingsProps {
  company: Company;
}

export function CompanySettings({ company }: CompanySettingsProps) {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Aquí iría la lógica para guardar la configuración
      toast.success("Configuración guardada exitosamente");
    } catch {
      toast.error("Error al guardar la configuración");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label>Notificaciones por email</Label>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones sobre actividades importantes en{" "}
                {company.email}
              </p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label>Alertas de seguridad</Label>
              <p className="text-sm text-muted-foreground">
                Recibe alertas sobre actividades sospechosas
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seguridad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Email de recuperación</Label>
              <Input type="email" placeholder={company.email} />
            </div>
            <div className="space-y-2">
              <Label>Número de teléfono de respaldo</Label>
              <Input type="tel" placeholder="+595 981 123 456" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading}>
              Guardar cambios
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zona horaria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Zona horaria predeterminada</Label>
            <select className="w-full rounded-md border p-2">
              <option value="America/Asuncion">America/Asuncion (GMT-4)</option>
              <option value="America/Sao_Paulo">
                America/Sao_Paulo (GMT-3)
              </option>
              <option value="America/Buenos_Aires">
                America/Buenos_Aires (GMT-3)
              </option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de peligro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Las siguientes acciones son irreversibles. Por favor, proceda con
              precaución.
            </p>
            <Button variant="destructive">Desactivar empresa</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
