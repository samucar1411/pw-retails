"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PieChartIcon, Loader2, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getIncidentTypes } from "@/services/incident-service";
import { api } from "@/services/api";
import { useRouter } from "next/navigation";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/* -------------------------------- helpers ------------------------------- */
// 1. Colores fijos para no perder consistencia entre renders
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#FF4560",
  "#775DD0",
];

interface IncidentDistributionChartProps {
  fromDate: string;
  toDate: string;
  officeId: string;
}

/* -------------------------- componente principal ------------------------- */
export function IncidentDistributionChart({ fromDate, toDate, officeId }: IncidentDistributionChartProps) {
  const router = useRouter();
  // Fetch incident types
  const { data: incidentTypesResponse, isLoading: isLoadingTypes } = useQuery({
    queryKey: ['incident-types'],
    queryFn: () => getIncidentTypes({ page_size: 100 }),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const incidentTypes = incidentTypesResponse?.results || [];

  // Fetch incident counts by type using individual API calls
  const { data: distributionCounts, isLoading: isLoadingCounts, error: countsError } = useQuery({
    queryKey: ['incident-distribution', fromDate, toDate, officeId, incidentTypes.map(t => t.id)],
    queryFn: async () => {
      if (!incidentTypes.length) return [];
      
      const countPromises = incidentTypes.map(async (type) => {
        try {
          // Build query parameters
          const params: Record<string, string> = {
            IncidentType: type.Name,
            page_size: '1' // We only need the count, not the actual data
          };
          
          // Add date filters if provided
          if (fromDate) params.Date_after = fromDate;
          if (toDate) params.Date_before = toDate;
          if (officeId) params.Office = officeId;
          
          const response = await api.get('/api/incidents/', { params });
          
          return {
            id: type.id,
            name: type.Name,
            value: response.data.count || 0,
            color: COLORS[incidentTypes.indexOf(type) % COLORS.length],
          };
        } catch (error) {
          console.error(`Error fetching count for incident type ${type.id}:`, error);
          return {
            id: type.id,
            name: type.Name,
            value: 0,
            color: COLORS[incidentTypes.indexOf(type) % COLORS.length],
          };
        }
      });
      
      const results = await Promise.all(countPromises);
      return results.filter(result => result.value > 0);
    },
    enabled: !!incidentTypes.length,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const distributionData = React.useMemo(() => distributionCounts || [], [distributionCounts]);
  
  const totalIncidents = React.useMemo(
    () => distributionData.reduce((sum, i) => sum + i.value, 0),
    [distributionData],
  );

  /* -----------------------------------------------------------------------
   * 5. Estados de carga / error
   * --------------------------------------------------------------------- */
  const isLoading = isLoadingTypes || isLoadingCounts;
  const hasError = countsError;
  const isEmpty = !isLoading && !hasError && distributionData.length === 0;

  return (
    <Card className="lg:col-span-3 flex flex-col">
      <CardHeader>
        <CardTitle>Distribución de incidentes</CardTitle>
        <CardDescription>
          Por tipo de incidente en el período seleccionado
          {totalIncidents > 0 ? ` (${totalIncidents} incidentes analizados)` : ''}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col items-center justify-center pb-4">
        {isLoading && (
          <LoadingState />
        )}
        {hasError && !isLoading && (
          <ErrorState />
        )}
        {isEmpty && !isLoading && !hasError && (
          <EmptyState />
        )}
        {!isLoading && !hasError && !isEmpty && (
          <ChartAndTable
            data={distributionData}
            total={totalIncidents}
            router={router}
            fromDate={fromDate}
            toDate={toDate}
            officeId={officeId}
          />
        )}
      </CardContent>
    </Card>
  );
}

/* --------------------------- sub-componentes UI -------------------------- */
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin mb-2" />
      <p className="text-sm font-medium">Cargando datos…</p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center h-[200px]">
      <p className="text-sm font-medium text-red-500">
        Error al cargar los datos
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
      <PieChartIcon className="h-12 w-12 mb-4 opacity-50" />
      <p className="text-sm font-medium">No hay datos disponibles</p>
      <p className="text-xs">No se registraron incidentes en este período</p>
    </div>
  );
}

type ChartAndTableProps = {
  data: {
    id: number;
    name: string;
    value: number;
    color: string;
  }[];
  total: number;
  router: AppRouterInstance;
  fromDate: string;
  toDate: string;
  officeId: string;
};

function ChartAndTable({ data, total, router, fromDate, toDate, officeId }: ChartAndTableProps) {
  
  const handleRowClick = (incidentTypeName: string) => {
    // Build the URL with filters
    const params = new URLSearchParams();
    
    // Add incident type filter
    params.set('IncidentType', incidentTypeName);
    
    // Add existing filters if they exist
    if (fromDate) params.set('Date_after', fromDate);
    if (toDate) params.set('Date_before', toDate);
    if (officeId) params.set('Office', officeId);
    
    // Navigate to incidents page with filters
    router.push(`/dashboard/incidentes?${params.toString()}`);
  };
  return (
    <div className="flex flex-col w-full">
      {/* ---------------------------- PieChart ---------------------------- */}
      <div className="h-[250px] mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <CustomTooltip payload={payload} total={total} />
                ) : null
              }
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              labelLine={false}
            >
              {data.map((d) => (
                <Cell key={d.id} fill={d.color} />
              ))}
            </Pie>
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              formatter={(_, entry, i) => (
                <span className="text-sm">
                  {data[i].name}: <strong>{data[i].value}</strong>
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ----------------------------- Tabla ----------------------------- */}
      <div className="border rounded-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium">
                Tipo de incidente
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium">
                Cantidad
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium">
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => {
              const pct = total ? Math.round((d.value / total) * 100) : 0;
              return (
                <tr 
                  key={d.id} 
                  className="border-t border-border hover:bg-muted/50 cursor-pointer transition-colors group"
                  onClick={() => handleRowClick(d.name)}
                  title={`Ver incidentes de tipo "${d.name}"`}
                >
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="group-hover:text-primary transition-colors">
                        {d.name}
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium group-hover:text-primary transition-colors">
                    {d.value}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">{pct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Using a pragmatic approach for Recharts tooltip types
type TooltipProps = {
  active?: boolean;
  // Using any here is intentional due to the complexity of Recharts types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  total: number;
};

function CustomTooltip({ payload, total }: TooltipProps) {
  // Early return if no payload or empty payload
  if (!payload || !payload.length || !payload[0]?.payload) {
    return null;
  }
  const { name, value, color } = payload[0].payload;
  const pct = total ? Math.round((value / total) * 100) : 0;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <div className="mb-2">
        <span className="text-sm font-semibold" style={{ color }}>
          {name}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-muted-foreground">
            Incidentes
          </span>
          <span className="font-bold text-foreground">{value}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-muted-foreground">
            Porcentaje
          </span>
          <span className="font-bold text-foreground">{pct}%</span>
        </div>
      </div>
    </div>
  );
}