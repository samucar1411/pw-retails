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
import { PieChartIcon, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getIncidentTypes } from "@/services/incident-service";
import { useAllIncidents } from "@/hooks/useAllIncidents";

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
  // Fetch incident types
  const { data: incidentTypesResponse, isLoading: isLoadingTypes } = useQuery({
    queryKey: ['incident-types'],
    queryFn: () => getIncidentTypes({ page_size: 100 }),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const incidentTypes = incidentTypesResponse?.results || [];

  // Use ALL incidents with filters - same as other dashboard components
  const { 
    data: incidentsData, 
    isLoading: isLoadingIncidents,
    error: incidentsError
  } = useAllIncidents(fromDate, toDate, officeId);

  // Get incidents array from the data structure
  const incidents = incidentsData?.incidents || [];

  const distributionData = React.useMemo(() => {
    if (!incidentTypes.length || !incidents.length) return [];

    // Count incidents by type
    const counts: Record<number, number> = {};
    
    incidents.forEach((incident) => {
      const typeId = incident.IncidentType;
      if (typeId) {
        counts[typeId] = (counts[typeId] || 0) + 1;
      }
    });

    return incidentTypes
      .map((type, idx) => ({
        id: type.id,
        name: type.Name, // siempre el nombre legible
        value: counts[type.id] ?? 0,
        color: COLORS[idx % COLORS.length],
      }))
      .filter((d) => d.value > 0);
  }, [incidentTypes, incidents]);

  const totalIncidents = React.useMemo(
    () => distributionData.reduce((sum, i) => sum + i.value, 0),
    [distributionData],
  );

  /* -----------------------------------------------------------------------
   * 5. Estados de carga / error
   * --------------------------------------------------------------------- */
  const isLoading = isLoadingTypes || isLoadingIncidents;
  const hasError = incidentsError;
  const isEmpty = !isLoading && !hasError && distributionData.length === 0;

  /* -----------------------------------------------------------------------
   * 6. Render UI
   * --------------------------------------------------------------------- */
  return (
    <Card className="lg:col-span-3 flex flex-col">
      <CardHeader>
        <CardTitle>Distribución de incidentes</CardTitle>
        <CardDescription>
          Por tipo de incidente en el período seleccionado
          {incidentsData?.total ? ` (${incidentsData.total} incidentes analizados)` : ''}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col items-center justify-center pb-4">
        {/* ------------------- Loading / Error / Empty states ------------------ */}
        {isLoading && (
          <LoadingState />
        )}
        {hasError && !isLoading && (
          <ErrorState />
        )}
        {isEmpty && !isLoading && !hasError && (
          <EmptyState />
        )}

        {/* ----------------------- Gráfico + tabla ---------------------------- */}
        {!isLoading && !hasError && !isEmpty && (
          <ChartAndTable
            data={distributionData}
            total={totalIncidents}
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
};

function ChartAndTable({ data, total }: ChartAndTableProps) {
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
                <tr key={d.id} className="border-t border-border">
                  <td className="px-4 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      {d.name}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm text-right font-medium">
                    {d.value}
                  </td>
                  <td className="px-4 py-2 text-sm text-right">{pct}%</td>
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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