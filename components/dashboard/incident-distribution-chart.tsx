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
import { Incident } from "@/types/incident";
import { PieChart as PieChartIcon } from "lucide-react";

interface IncidentDistributionChartProps {
  data: Incident[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function IncidentDistributionChart({ data }: IncidentDistributionChartProps) {
  // Process data to get incident type distribution
  const distributionData = React.useMemo(() => {
    const typeCount = data.reduce((acc, incident) => {
      acc[incident.incidentTypeId] = (acc[incident.incidentTypeId] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(typeCount).map(([type, count]) => ({
      name: `Tipo ${type}`,
      value: count
    }));
  }, [data]);

  const isEmpty = distributionData.length === 0;

  return (
    <Card className="lg:col-span-3 flex flex-col">
      <CardHeader>
        <CardTitle>Distribución de incidentes</CardTitle>
        <CardDescription>Por tipo de incidente</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center pb-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <PieChartIcon className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm font-medium">No hay datos disponibles</p>
            <p className="text-xs">No se han registrado incidentes aún</p>
          </div>
        ) : (
          <div className="w-full h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Tipo
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {payload[0].name}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Cantidad
                              </span>
                              <span className="font-bold">
                                {payload[0].value}
                              </span>
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
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
 