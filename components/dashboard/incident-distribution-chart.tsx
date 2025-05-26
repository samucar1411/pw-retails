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
import { PieChart as PieChartIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getIncidentTypes } from "@/services/incident-service";
import { api } from "@/services/api";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF4560', '#775DD0'];

export function IncidentDistributionChart() {
  // Consulta para obtener los tipos de incidentes
  const { 
    data: incidentTypes = [], 
    isLoading: isLoadingTypes,
    error: typesError 
  } = useQuery({
    queryKey: ['incidentTypes'],
    queryFn: async () => {
      const response = await getIncidentTypes();
      console.log('Tipos de incidentes obtenidos:', response.results);
      return response.results || [];
    }
  });

  // Una sola consulta para obtener todos los incidentes
  const { 
    data: incidents = [], 
    isLoading: isLoadingIncidents,
    error: incidentsError 
  } = useQuery({
    queryKey: ['incidents-for-distribution'],
    queryFn: async () => {
      // Obtener todos los incidentes con un límite razonable
      const { data } = await api.get('/api/incidents/', { 
        params: { 
          format: 'json', 
          page_size: 50 // Limitar a 50 incidentes para el dashboard
        } 
      });
      console.log('Incidentes obtenidos para distribución:', data.results?.length || 0);
      return data.results || [];
    },
    enabled: incidentTypes.length > 0 // Solo ejecutar cuando tengamos los tipos de incidentes
  });

  // Determinar si las consultas están cargando
  const isLoading = isLoadingTypes || isLoadingIncidents;
  
  // Determinar si hay algún error
  const hasError = typesError || incidentsError;

  // Procesar los datos para el gráfico
  const incidentCounts = React.useMemo(() => {
    if (isLoading || hasError || !incidents.length) return {};
    
    const counts: Record<number, number> = {};
    
    // Inicializar conteos con 0 para todos los tipos
    incidentTypes.forEach((type: { id: number }) => {
      counts[type.id] = 0;
    });
    
    // Contar incidentes por tipo
    incidents.forEach((incident: { IncidentType?: number }) => {
      if (incident.IncidentType) {
        counts[incident.IncidentType] = (counts[incident.IncidentType] || 0) + 1;
      }
    });
    
    console.log('Conteo final de incidentes por tipo:', counts);
    return counts;
  }, [incidentTypes, incidents, isLoading, hasError]);

  // Process data for the chart
  const distributionData = React.useMemo(() => {
    console.log('Processing chart data with counts:', incidentCounts);
    console.log('Available incident types:', incidentTypes);
    
    // Si no hay tipos de incidentes cargados todavía, devolver un array vacío
    if (incidentTypes.length === 0) {
      return [];
    }
    
    // Crear datos para todos los tipos de incidentes, incluso los que tienen 0 incidentes
    // para asegurar que se muestren en el gráfico
    const chartData = incidentTypes.map((type: { id: number; name: string }) => {
      const count = incidentCounts[type.id] || 0;
      
      console.log(`Tipo de incidente: ${type.name} (ID: ${type.id}) - Cantidad: ${count}`);
      
      return {
        id: type.id,
        name: type.name || `Tipo ${type.id}`,
        value: count
      };
    }).filter((item: { value: number }) => item.value > 0); // Solo incluir tipos con incidentes
    
    console.log('Datos finales para el gráfico:', chartData);
    return chartData;
  }, [incidentCounts, incidentTypes]);

  const isEmpty = distributionData.length === 0;

  return (
    <Card className="lg:col-span-3 flex flex-col">
      <CardHeader>
        <CardTitle>Distribución de incidentes</CardTitle>
        <CardDescription>Por tipo de incidente</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center pb-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <p className="text-sm font-medium">Cargando datos...</p>
          </div>
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <p className="text-sm font-medium text-red-500">Error al cargar los datos</p>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <PieChartIcon className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm font-medium">No hay datos disponibles</p>
            <p className="text-xs">No se han registrado incidentes aún</p>
          </div>
        ) : (
          <div className="flex flex-col w-full">
            <div className="h-[250px] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const percentage = distributionData.length > 0
                          ? Math.round((data.value / distributionData.reduce((sum, item) => sum + item.value, 0)) * 100)
                          : 0;
                          
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-md">
                            <div className="mb-2">
                              <span className="text-sm font-semibold" style={{ color: payload[0].color }}>
                                {data.name}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Incidentes
                                </span>
                                <span className="font-bold text-foreground">
                                  {data.value}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Porcentaje
                                </span>
                                <span className="font-bold text-foreground">{percentage}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={false}
                    labelLine={false}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    formatter={(value, entry, index: number) => {
                      const item = distributionData[index];
                      return <span className="text-sm">{value}: <strong>{item.value}</strong></span>;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Tabla de distribución de incidentes por tipo */}
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-foreground">Tipo de Incidente</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-foreground">Cantidad</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-foreground">Porcentaje</th>
                  </tr>
                </thead>
                <tbody>
                  {distributionData.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-center text-sm text-muted-foreground">
                        No hay datos disponibles
                      </td>
                    </tr>
                  ) : (
                    distributionData.map((item: { id: number; name: string; value: number }, index: number) => {
                      const totalIncidents = distributionData.reduce((sum: number, i: { value: number }) => sum + i.value, 0);
                      const percentage = totalIncidents > 0 ? Math.round((item.value / totalIncidents) * 100) : 0;
                      
                      return (
                        <tr key={item.id} className="border-t border-border">
                          <td className="px-4 py-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              {item.name}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm text-right font-medium">{item.value}</td>
                          <td className="px-4 py-2 text-sm text-right">{percentage}%</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
