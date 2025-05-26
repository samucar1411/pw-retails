"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Incident } from "@/types/incident";
import { BarChart as BarChartIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export function BranchComparisonChart() {
  // Obtener los incidentes usando React Query con configuración optimizada
  const { 
    data: incidents = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['incidents-for-branches'],
    queryFn: async () => {
      try {
        // Obtener la primera página para conocer el total de incidentes
        const firstPageResponse = await api.get('/api/incidents/', { 
          params: { 
            format: 'json',
            page: 1,
            page_size: 10, // La API permite máximo 10 por página
            ordering: '-created_at'
          } 
        });
        
        const totalIncidents = firstPageResponse.data.count || 0;
        const totalPages = Math.ceil(totalIncidents / 10);
        console.log(`Total de incidentes: ${totalIncidents}, páginas necesarias: ${totalPages}`);
        
        // Si solo hay una página, devolver los resultados directamente
        if (totalPages <= 1) {
          return firstPageResponse.data.results || [];
        }
        
        // Limitar a máximo 5 páginas (50 incidentes) para no sobrecargar
        const pagesToFetch = Math.min(totalPages, 5);
        
        // Crear un array de promesas para las páginas adicionales
        const pagePromises = [];
        for (let page = 2; page <= pagesToFetch; page++) {
          pagePromises.push(
            api.get('/api/incidents/', {
              params: {
                format: 'json',
                page,
                page_size: 10,
                ordering: '-created_at'
              }
            })
          );
        }
        
        // Ejecutar todas las consultas en paralelo
        const additionalResponses = await Promise.all(pagePromises);
        
        // Combinar todos los resultados
        const allIncidents = [
          ...firstPageResponse.data.results,
          ...additionalResponses.flatMap(response => response.data.results || [])
        ];
        
        console.log(`Incidentes obtenidos para comparativa de sucursales: ${allIncidents.length}`);
        return allIncidents;
      } catch (error) {
        console.error('Error al obtener incidentes para comparativa:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000 // 5 minutos de caché
  });

  // Process data to get incidents by office
  const chartData = React.useMemo(() => {
    if (!incidents.length) return [];
    
    const officeCount = incidents.reduce((acc: Record<number, number>, incident: Incident) => {
      // Asegurarse de que officeId existe
      if (incident.officeId) {
        acc[incident.officeId] = (acc[incident.officeId] || 0) + 1;
      }
      return acc;
    }, {});

    interface ChartDataItem {
      name: string;
      incidents: number;
    }
    
    return Object.entries(officeCount)
      .map(([office, count]): ChartDataItem => ({
        name: `Sucursal ${office}`,
        incidents: count
      }))
      // Ordenar por número de incidentes (descendente)
      .sort((a, b) => (b.incidents as number) - (a.incidents as number));
  }, [incidents]);

  const summaryStats = React.useMemo(() => ({
    reportedIncidents: incidents.length,
    affectedBranches: new Set(incidents
      .filter((incident: Incident) => incident.officeId)
      .map((incident: Incident) => incident.officeId)).size,
  }), [incidents]);

  const isEmpty = chartData.length === 0;

  return (
    <Card className="lg:col-span-7">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
          <div>
            <CardTitle>Comparativa de sucursales</CardTitle>
            <CardDescription>Por número de incidentes</CardDescription>
          </div>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Incidentes reportados</p>
              <p className="text-xl font-bold">{summaryStats.reportedIncidents}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Sucursales afectadas</p>
              <p className="text-xl font-bold">{summaryStats.affectedBranches}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pl-2 pr-6 pb-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <p className="text-sm font-medium">Cargando datos...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <p className="text-sm font-medium text-red-500">Error al cargar los datos</p>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <BarChartIcon className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm font-medium">No hay datos disponibles</p>
            <p className="text-xs">No se han registrado incidentes aún</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted)) / 0.5" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-1 gap-1">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {label}
                          </span>
                          <span className="font-bold">
                            {`${payload[0].value} Incidentes`}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ fill: "hsl(var(--muted)) / 0.3" }}
              />
              <Bar
                dataKey="incidents"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
} 