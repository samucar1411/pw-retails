import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Company } from "@/types/company";
import { Building2, Contact, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import dynamic from "next/dynamic";

// Dynamically import the map component to avoid SSR issues
const Map = dynamic(() => import("@/components/ui/map"), { ssr: false });

// Mock data for the overview
const mockOfficeLocations = [
  { lat: -25.2867, lng: -57.3333, title: "Sucursal Central" },
  { lat: -25.3089, lng: -57.3325, title: "Sucursal Sur" },
  { lat: -25.2816, lng: -57.3478, title: "Sucursal Norte" },
];

const mockStats = {
  totalEmployees: 2350,
  activeOffices: 12,
  monthlyRevenue: 250000000,
  lastIncident: "2 días atrás",
};

interface CompanyOverviewProps {
  company: Company;
}

export function CompanyOverview({ company }: CompanyOverviewProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sucursales</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.activeOffices}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Activas en {company.country}
              </p>
              <Badge variant="outline" className="text-xs">
                +2 este mes
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empleados</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalEmployees}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Registrados en el sistema
              </p>
              <Badge variant="outline" className="text-xs">
                +15 este mes
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Facturación Mensual
            </CardTitle>
            <Contact className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("es-PY", {
                style: "currency",
                currency: "PYG",
                maximumFractionDigits: 0,
              }).format(mockStats.monthlyRevenue)}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Último mes</p>
              <Badge variant="outline" className="text-xs">
                +5% vs mes anterior
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Último Incidente
            </CardTitle>
            <Contact className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.lastIncident}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Sin incidentes graves
              </p>
              <Badge variant="success" className="text-xs">
                Seguro
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Información de la empresa</CardTitle>
                  <CardDescription>
                    Detalles generales y contactos
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Contact className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-4">
                  <div className="rounded-lg border bg-card p-4">
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                      <User className="h-4 w-4 text-primary" />
                      Representante Legal
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">
                          {company.legal_names} {company.legal_last_names}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Contact className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">
                          CI: {company.legal_identification_number}
                        </p>
                      </div>
                      <Badge variant="outline" className="mt-1">
                        Representante Legal
                      </Badge>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-card p-4">
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                      <User className="h-4 w-4 text-primary" />
                      Contacto Principal
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{company.contact}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Contact className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{company.email}</p>
                      </div>
                      <Badge variant="outline" className="mt-1">
                        Contacto Principal
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border bg-card p-4">
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                      <Building2 className="h-4 w-4 text-primary" />
                      Información Comercial
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{company.business_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Contact className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">
                          RUC: {company.identification_number}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Contact className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{company.economy_activity}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-card p-4">
                    <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                      <Contact className="h-4 w-4 text-primary" />
                      Ubicación y Alcance
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Contact className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">{company.country}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">
                          {company.emp_qty} empleados registrados
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">
                          {mockStats.activeOffices} sucursales activas
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Documentos Importantes</CardTitle>
                  <CardDescription>
                    Archivos y documentos legales de la empresa
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-initial"
                  >
                    <Contact className="h-4 w-4 mr-2" />
                    Descargar todos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-initial"
                  >
                    <Contact className="h-4 w-4 mr-2" />
                    Subir
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 hover:bg-muted/50 rounded-lg px-2 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      <Contact className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        Contrato de Servicios.pdf
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF • 2.3MB • Actualizado hace 2 días
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <Contact className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 hover:bg-muted/50 rounded-lg px-2 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      <Contact className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        Licencia Comercial.pdf
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF • 1.1MB • Actualizado hace 1 semana
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <Contact className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 hover:bg-muted/50 rounded-lg px-2 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      <Contact className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        Certificado de Registro.pdf
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF • 890KB • Actualizado hace 1 mes
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <Contact className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 hover:bg-muted/50 rounded-lg px-2 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      <Contact className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        Manual de Operaciones.pdf
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF • 4.5MB • Actualizado hace 2 meses
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <Contact className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Ubicación de Sucursales</CardTitle>
                  <CardDescription>
                    Vista general de todas las sucursales
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Ver todas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] sm:h-[400px] w-full rounded-md border">
                <Map locations={mockOfficeLocations} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>
                    Últimas actualizaciones y eventos
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-full flex-shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      Nuevo empleado registrado
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Hace 2 horas
                    </p>
                  </div>
                </div>
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2 bg-accent/20 rounded-full flex-shrink-0">
                    <Building2 className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      Sucursal actualizada
                    </p>
                    <p className="text-xs text-muted-foreground">Hace 1 día</p>
                  </div>
                </div>
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2 bg-yellow-50/40 dark:bg-yellow-900/40 rounded-full flex-shrink-0">
                    <Contact className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      Documento actualizado
                    </p>
                    <p className="text-xs text-muted-foreground">Hace 2 días</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
