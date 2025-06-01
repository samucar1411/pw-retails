"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TrendingUp, Loader2 } from "lucide-react";
import { usePaginatedIncidents } from "@/hooks/usePaginatedIncidents";

interface TrendLineChartProps {
  fromDate: string;
  toDate: string;
  officeId: string;
}

function generateDateRange(fromDate: string, toDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(fromDate);
  const end = new Date(toDate);
  
  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

export function TrendLineChart({ fromDate, toDate, officeId }: TrendLineChartProps) {
  const { 
    data: incidents = [], 
    isLoading, 
    error 
  } = usePaginatedIncidents(fromDate, toDate, officeId);

  const trendData = React.useMemo(() => {
    if (!incidents.length) return [];

    // Generate all dates in range
    const dateRange = generateDateRange(fromDate, toDate);
    
    // Initialize all dates with count 0
    const trendMap: Record<string, number> = {};
    dateRange.forEach(date => {
      trendMap[date] = 0;
    });

    // Count incidents by date
    incidents.forEach(incident => {
      const date = incident.Date;
      if (date && trendMap.hasOwnProperty(date)) {
        trendMap[date]++;
      }
    });

    // Convert to array of objects sorted by date
    return dateRange.map(date => ({
      date,
      count: trendMap[date],
      formattedDate: new Date(date).toLocaleDateString('es-PY', { 
        month: 'short', 
        day: 'numeric' 
      })
    }));
  }, [incidents, fromDate, toDate]);

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendencia de incidentes
          </CardTitle>
          <CardDescription>Evolución diaria en el período seleccionado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendencia de incidentes
          </CardTitle>
          <CardDescription>Evolución diaria en el período seleccionado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">Error al cargar datos de tendencia</div>
        </CardContent>
      </Card>
    );
  }

  if (trendData.length === 0) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Tendencia de incidentes
          </CardTitle>
          <CardDescription>Evolución diaria en el período seleccionado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <TrendingUp className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm font-medium">No hay datos de tendencia</p>
            <p className="text-xs">No se registraron incidentes en este período</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Tendencia de incidentes
        </CardTitle>
        <CardDescription>
          Evolución diaria en el período seleccionado ({incidents.length} incidentes total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="formattedDate" 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <p className="text-sm font-medium">{data.date}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-3 h-3 rounded-full bg-primary"></div>
                          <span className="text-sm">
                            {data.count} incidente{data.count !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 