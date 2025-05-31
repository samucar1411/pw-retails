'use client'

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// Calendar picker removed
import { PlusCircle } from "lucide-react"
import { RecentIncidentsTable } from "@/components/dashboard/recent-incidents-table"
import { OfficeMap } from "@/components/dashboard/incident-map"
import { IncidentDistributionChart } from "@/components/dashboard/incident-distribution-chart"
import { BranchComparisonChart } from "@/components/dashboard/branch-comparison-chart"
import Link from "next/link"
import * as suspectService from "@/services/suspect-service"
import * as incidentService from "@/services/incident-service"
import { Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/services/api"

// Import types from the types directory
import { Incident, IncidentType } from "@/types/incident";

// Local interfaces for dashboard data
interface Office {
  id: number;
  name: string;
}

interface DashboardData {
  incidents: Incident[];
  incidentCount: number;
  types: IncidentType[];
  offices: Office[];
  suspectCount: number;
}

interface SuspectDetailData {
  identifiedCount: number;
  unidentifiedCount: number;
}

export default function DashboardPage() {
  // Filtros locales - Using fixed values since UI selectors were removed
  const page = 1;
  const pageSize = 50;

  // Consulta centralizada para obtener datos del dashboard
  const { 
    data: dashboardData,
    isLoading: isLoadingDashboard,
    error: dashboardError
  } = useQuery<DashboardData>({
    queryKey: ['dashboard-data', { page, pageSize }],
    queryFn: async () => {
      try {
        // Realizar consultas en paralelo para mejorar el rendimiento
        const [incidentsRes, typesRes, officesRes, suspectsRes] = await Promise.all([
          incidentService.getLatestIncidents({ page, page_size: pageSize }),
          api.get('/api/incidenttypes/', { params: { format: 'json' } }),
          api.get('/api/offices/', { params: { format: 'json' } }),
          api.get('/api/suspects/', { params: { format: 'json', page_size: 1 } }) // Solo necesitamos el count
        ]);
        
        console.log('Datos centralizados obtenidos para el dashboard');
        
        return {
          incidents: incidentsRes.results || [],
          incidentCount: incidentsRes.count || 0,
          types: typesRes.data.results || [],
          offices: officesRes.data.results || [],
          suspectCount: suspectsRes.data.count || 0
        };
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000 // 5 minutos de caché
  });

  // Calcular estadísticas a partir de los datos obtenidos
  const stats = React.useMemo(() => {
    if (!dashboardData) {
      return {
        totalIncidents: 0,
        affectedOffices: 0,
        suspectCount: 0
      };
    }
    
    // Calcular oficinas afectadas
    const affectedOffices = new Set(
      dashboardData.incidents
        .filter((incident: Incident) => incident.officeId)
        .map((incident: Incident) => incident.officeId)
    ).size;
    
    return {
      totalIncidents: dashboardData.incidentCount,
      affectedOffices,
      suspectCount: dashboardData.suspectCount
    };
  }, [dashboardData]);
  
  // Para compatibilidad con componentes existentes
  const incidents = dashboardData?.incidents || [];

  // Obtener datos de sospechosos identificados y no identificados
  const { 
    data: suspectDetailData,
    isLoading: isLoadingSuspectDetails
  } = useQuery<SuspectDetailData>({
    queryKey: ['suspect-details'],
    queryFn: async () => {
      try {
        // Usar el servicio para obtener los conteos filtrados
        const [identified, unidentified] = await Promise.all([
          suspectService.getAllSuspects({ identified: true, page: 1, pageSize: 1 }),
          suspectService.getAllSuspects({ identified: false, page: 1, pageSize: 1 })
        ]);
        
        return {
          identifiedCount: identified.count || 0,
          unidentifiedCount: unidentified.count || 0
        };
      } catch (error) {
        console.error('Error fetching suspect details:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000 // 5 minutos de caché
  });

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
            {isLoadingDashboard ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground text-sm">Cargando...</span>
              </div>
            ) : dashboardError ? (
              <div className="text-sm text-destructive">Error al cargar datos</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalIncidents}</div>
                <Link href="/dashboard/incidentes" className="text-xs text-primary hover:underline inline-block">
                  Ver incidentes
                </Link>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sospechosos identificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSuspectDetails ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground text-sm">Cargando...</span>
              </div>
            ) : dashboardError ? (
              <div className="text-sm text-destructive">Error al cargar datos</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{suspectDetailData?.identifiedCount || 0}</div>
                <Link href="/dashboard/sospechosos" className="text-xs text-primary hover:underline inline-block">
                  Ver sospechosos
                </Link>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sospechosos no identificados</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSuspectDetails ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground text-sm">Cargando...</span>
              </div>
            ) : dashboardError ? (
              <div className="text-sm text-destructive">Error al cargar datos</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{suspectDetailData?.unidentifiedCount || 0}</div>
                <Link href="/dashboard/sospechosos" className="text-xs text-primary hover:underline inline-block">
                  Ver sospechosos
                </Link>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sucursales afectadas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingDashboard ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground text-sm">Cargando...</span>
              </div>
            ) : dashboardError ? (
              <div className="text-sm text-destructive">Error al cargar datos</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.affectedOffices}</div>
                <Link href="/dashboard/offices" className="text-xs text-primary hover:underline inline-block">
                  Ver sucursales afectadas
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* <div className="grid gap-4 grid-cols-1">
        {isLoadingDashboard ? (
          <Card className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Cargando datos de incidentes por hora...</p>
          </Card>
        ) : dashboardError ? (
          <Card className="flex items-center justify-center h-[300px]">
            <p>Error al cargar datos: {String(dashboardError)}</p>
          </Card>
        ) : (
          <HourlyIncidentsChart data={incidents} />
        )}
      </div> */}

      <div className="grid gap-4 grid-cols-1">
        {isLoadingDashboard ? (
          <Card className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Cargando tabla de incidentes recientes...</p>
          </Card>
        ) : dashboardError ? (
          <Card className="flex items-center justify-center h-[300px]">
            <p>Error al cargar datos: {String(dashboardError)}</p>
          </Card>
        ) : (
          <RecentIncidentsTable data={incidents} />
        )}
      </div>

      {/* Row 3: Map and Pie Chart */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        {isLoadingDashboard ? (
          <Card className="lg:col-span-4 flex items-center justify-center h-[300px]">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Cargando mapa de oficinas...</p>
          </Card>
        ) : dashboardError ? (
          <Card className="lg:col-span-4 flex items-center justify-center h-[300px]">
            <p>Error al cargar datos: {String(dashboardError)}</p>
          </Card>
        ) : (
          <OfficeMap />
        )}
        <IncidentDistributionChart />
      </div>
      
      <div className="grid gap-4 grid-cols-1">
        <BranchComparisonChart />
      </div>

      <Link href="/dashboard/incidentes" className="...">
        {/* ... existing code ... */}
      </Link>
    </div>
  )
} 