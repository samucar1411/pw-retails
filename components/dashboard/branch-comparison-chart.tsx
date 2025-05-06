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

interface BranchComparisonChartProps {
  data: Incident[];
}

export function BranchComparisonChart({ data }: BranchComparisonChartProps) {
  // Process data to get incidents by office
  const chartData = React.useMemo(() => {
    const officeCount = data.reduce((acc, incident) => {
      acc[incident.officeId] = (acc[incident.officeId] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(officeCount).map(([office, count]) => ({
      name: `Sucursal ${office}`,
      incidents: count
    }));
  }, [data]);

  const summaryStats = {
    reportedIncidents: data.length,
    affectedBranches: new Set(data.map(incident => incident.officeId)).size,
  };

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
        {isEmpty ? (
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