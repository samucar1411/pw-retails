"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DollarSign, Loader2 } from "lucide-react";
import { useAllIncidents } from "@/hooks/useAllIncidents";

interface EconomicBarChartProps {
  fromDate: string;
  toDate: string;
  officeId: string;
}

function parseNumeric(value: string | number | undefined): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return value;
  return parseFloat(value) || 0;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("es-PY", {
    style: "currency",
    currency: "PYG",
    maximumFractionDigits: 0,
  });
}

export function EconomicBarChart({ fromDate, toDate, officeId }: EconomicBarChartProps) {
  const { 
    data: incidentsData, 
    isLoading, 
    error 
  } = useAllIncidents(fromDate, toDate, officeId);

  const economicData = React.useMemo(() => {
    const incidents = incidentsData?.incidents || [];
    
    // New separated cash fields
    const sumCashBox = incidents.reduce((sum, incident) => {
      const incidentWithCash = incident as { cashFondo?: string | number };
      return sum + parseNumeric(incidentWithCash.cashFondo);
    }, 0);
    let sumCashCollection = incidents.reduce((sum, incident) => {
      const incidentWithCash = incident as { cashRecaudacion?: string | number };
      return sum + parseNumeric(incidentWithCash.cashRecaudacion);
    }, 0);
    
    // Legacy cash field (for existing data that doesn't have separated cash)
    const sumLegacyCash = incidents.reduce((sum, incident) => 
      sum + parseNumeric(incident.CashLoss), 0);
    
    // If no separated cash but have legacy cash, put all legacy cash in "Efectivo Recaudación"
    if (sumCashBox === 0 && sumCashCollection === 0 && sumLegacyCash > 0) {
      sumCashCollection = sumLegacyCash;
    }
    
    const sumMerch = incidents.reduce((sum, incident) => 
      sum + parseNumeric(incident.MerchandiseLoss), 0);
    const sumOther = incidents.reduce((sum, incident) => 
      sum + parseNumeric(incident.OtherLosses), 0);

    // Always return the same 4 categories
    return [
      { 
        name: "Efectivo Caja", 
        value: sumCashBox,
        formattedValue: formatCurrency(sumCashBox),
        fill: "#3b82f6"
      },
      { 
        name: "Efectivo Recaudación", 
        value: sumCashCollection,
        formattedValue: formatCurrency(sumCashCollection),
        fill: "#10b981"
      },
      { 
        name: "Mercancía", 
        value: sumMerch,
        formattedValue: formatCurrency(sumMerch),
        fill: "#f59e0b"
      },
      { 
        name: "Otros", 
        value: sumOther,
        formattedValue: formatCurrency(sumOther),
        fill: "#ef4444"
      }
    ];
  }, [incidentsData]);

  const totalLoss = React.useMemo(() => {
    return economicData.reduce((sum, item) => sum + item.value, 0);
  }, [economicData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5 text-primary" />
            Pérdidas económicas
          </CardTitle>
          <CardDescription>Por tipo de pérdida en el período seleccionado</CardDescription>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5 text-primary" />
            Pérdidas económicas
          </CardTitle>
          <CardDescription>Por tipo de pérdida en el período seleccionado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">Error al cargar datos económicos</div>
        </CardContent>
      </Card>
    );
  }

  // Only show "no data" if there are no incidents at all
  if (!incidentsData?.incidents?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5 text-primary" />
            Pérdidas económicas
          </CardTitle>
          <CardDescription>Por tipo de pérdida en el período seleccionado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <DollarSign className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm font-medium">Sin incidentes registrados</p>
            <p className="text-xs">No hay datos para el período seleccionado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5 text-primary" />
          Pérdidas económicas
        </CardTitle>
        <CardDescription>
          Por tipo de pérdida - Total: {formatCurrency(totalLoss)} 
          {incidentsData?.total ? ` (${incidentsData.total} incidentes)` : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={economicData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="text-xs"
                tick={{ fontSize: 10 }}
                interval={0}
              />
              <YAxis 
                className="text-xs"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const percentage = totalLoss > 0 ? ((data.value / totalLoss) * 100).toFixed(1) : 0;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <p className="text-sm font-medium">{data.name}</p>
                        <div className="space-y-1 mt-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: data.fill }}
                            ></div>
                            <span className="text-sm font-bold">
                              {data.formattedValue}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {percentage}% del total
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="value"
              >
                {economicData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary cards grid */}
        <div className="mt-4 sm:mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {economicData.map((item) => {
            const percentage = totalLoss > 0 ? ((item.value / totalLoss) * 100).toFixed(1) : 0;
            return (
              <div key={item.name} className="p-3 rounded-lg border bg-card/50 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-xs font-medium text-muted-foreground">{item.name}</span>
                </div>
                <p className="text-sm font-bold">{item.formattedValue}</p>
                <p className="text-xs text-muted-foreground">{percentage}%</p>
              </div>
            );
          })}
        </div>
        
        {/* Total */}
        <div className="mt-3 p-3 rounded-lg border-2 bg-muted/20 text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Pérdidas</p>
          <p className="text-sm font-bold">{formatCurrency(totalLoss)}</p>
        </div>
      </CardContent>
    </Card>
  );
} 