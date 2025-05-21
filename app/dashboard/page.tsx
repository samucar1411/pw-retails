'use client'

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker"
import { PlusCircle } from "lucide-react"
import { HourlyIncidentsChart } from "@/components/dashboard/hourly-incidents-chart"
import { RecentIncidentsTable } from "@/components/dashboard/recent-incidents-table"
import { OfficeMap } from "@/components/dashboard/incident-map"
import { IncidentDistributionChart } from "@/components/dashboard/incident-distribution-chart"
import { BranchComparisonChart } from "@/components/dashboard/branch-comparison-chart"
import Link from "next/link"
import { useIncident } from "@/context/incident-context"
import { useSuspects } from "@/context/suspect-context"
import { useOffice } from "@/context/office-context"

export default function DashboardPage() {
  const { incidents, loadIncidentsWithFilters } = useIncident();
  const { suspects } = useSuspects();

  // Filtros locales
  const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date }>({});
  const [ordering, setOrdering] = React.useState<string>("-created_at");
  const [page, setPage] = React.useState<number>(1);

  // Actualizar incidentes al cambiar filtros
  React.useEffect(() => {
    const filters: any = { ordering, page };
    if (dateRange.from) {
      filters.created_at_after = dateRange.from.toISOString().slice(0, 10);
    }
    if (dateRange.to) {
      filters.created_at_before = dateRange.to.toISOString().slice(0, 10);
    }
    loadIncidentsWithFilters(filters);
  }, [dateRange, ordering, page, loadIncidentsWithFilters]);

  // Calculate dashboard statistics
  const totalIncidents = incidents.length;
  const identifiedSuspects = suspects.filter(s => s.statusId === 1).length; // Assuming statusId 1 is for identified suspects
  const unidentifiedSuspects = suspects.filter(s => s.statusId === 2).length; // Assuming statusId 2 is for unidentified suspects
  const affectedOffices = new Set(incidents.map(incident => incident.officeId)).size;

  // Get offices from context
  const { offices, isLoading: isLoadingOffices, error: officeError } = useOffice();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Visión General</h2>
          <p className="text-muted-foreground">
            Monitorear actividad principal
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker
  initialDate={dateRange.from && dateRange.to ? { from: dateRange.from, to: dateRange.to } : undefined}
  onDateChange={(range) => setDateRange({ from: range?.from, to: range?.to })}
/>
<select
  className="ml-2 border rounded px-2 py-1"
  value={ordering}
  onChange={e => setOrdering(e.target.value)}
>
  <option value="-created_at">Más recientes</option>
  <option value="created_at">Más antiguos</option>
</select>
          <Link href="/dashboard/incidentes/nuevo">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Registrar incidente
            </Button>
          </Link>
        </div>
      </div>

      {/* Dashboard Widgets Grid */}
      {/* Stats Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de incidentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIncidents}</div>
            <p className="text-xs text-muted-foreground">
              Ver incidentes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sospechosos identificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{identifiedSuspects}</div>
            <p className="text-xs text-muted-foreground">
              Ver sospechosos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sospechosos no identificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unidentifiedSuspects}</div>
            <p className="text-xs text-muted-foreground">
              Ver sospechosos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sucursales afectadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affectedOffices}</div>
            <p className="text-xs text-muted-foreground">
              Ver sucursales afectadas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1">
        <HourlyIncidentsChart data={incidents} />
      </div>

      <div className="grid gap-4 grid-cols-1">
          <RecentIncidentsTable data={incidents} />
      </div>

      {/* Row 3: Map and Pie Chart */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          {isLoadingOffices ? (
            <Card className="lg:col-span-4 flex items-center justify-center h-[300px]">
              <p>Cargando mapa de oficinas...</p>
            </Card>
          ) : officeError ? (
            <Card className="lg:col-span-4 flex items-center justify-center h-[300px]">
              <p>Error al cargar oficinas: {officeError.message}</p>
            </Card>
          ) : (
            <OfficeMap data={offices} />
          )}
          <IncidentDistributionChart data={incidents} />
      </div>
      
      <div className="grid gap-4 grid-cols-1">
          <BranchComparisonChart data={incidents} />
      </div>

      <Link href="/dashboard/incidentes" className="...">
        {/* ... existing code ... */}
      </Link>
    </div>
  )
} 