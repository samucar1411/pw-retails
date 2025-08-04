"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { useFilteredDashboardData } from "@/hooks/useDashboardOptimized";
import Link from "next/link";

interface KpiTotalIncidentsOptimizedProps {
  fromDate: string;
  toDate: string;
  officeId: string;
}

interface PreviousPeriod {
  prevFrom: string;
  prevTo: string;
}

function calculatePreviousPeriod(fromDate: string, toDate: string): PreviousPeriod | null {
  // Return null if dates are empty or invalid
  if (!fromDate || !toDate || fromDate.trim() === '' || toDate.trim() === '') {
    return null;
  }

  const from = new Date(fromDate);
  const to = new Date(toDate);
  
  // Check if dates are valid
  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return null;
  }

  // Calculate the duration in days
  const duration = Math.abs(to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
  
  // Calculate previous period dates
  const prevTo = new Date(from.getTime() - 24 * 60 * 60 * 1000); // Day before fromDate
  const prevFrom = new Date(prevTo.getTime() - duration * 24 * 60 * 60 * 1000);

  return {
    prevFrom: prevFrom.toISOString().split('T')[0],
    prevTo: prevTo.toISOString().split('T')[0]
  };
}

export function KpiTotalIncidentsOptimized({ 
  fromDate, 
  toDate, 
  officeId 
}: KpiTotalIncidentsOptimizedProps) {
  
  // Get current period data - uses cached data from context
  const { 
    data: currentData, 
    isLoading: currentLoading, 
    error: currentError 
  } = useFilteredDashboardData(fromDate, toDate, officeId);

  // Calculate previous period
  const previousPeriod = React.useMemo(() => 
    calculatePreviousPeriod(fromDate, toDate), 
    [fromDate, toDate]
  );

  // Get previous period data - also uses cached data
  const { 
    data: previousData, 
    isLoading: previousLoading 
  } = useFilteredDashboardData(
    previousPeriod?.prevFrom, 
    previousPeriod?.prevTo, 
    officeId
  );

  // Calculate trend
  const trend = React.useMemo(() => {
    if (!currentData || !previousData || !previousPeriod) {
      return null;
    }

    const currentTotal = currentData.totalIncidents;
    const previousTotal = previousData.totalIncidents;
    
    if (previousTotal === 0) {
      return currentTotal > 0 ? { type: 'up', percentage: 100 } : null;
    }

    const change = currentTotal - previousTotal;
    const percentage = Math.abs((change / previousTotal) * 100);
    
    return {
      type: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      percentage: Math.round(percentage)
    };
  }, [currentData, previousData, previousPeriod]);

  if (currentLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Incidentes</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentError) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Incidentes</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">Error</div>
          <p className="text-xs text-muted-foreground">
            No se pudieron cargar los datos
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalIncidents = currentData?.totalIncidents || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total de Incidentes</CardTitle>
        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{totalIncidents.toLocaleString()}</div>
          
          {trend && (
            <div className="flex items-center space-x-1">
              {trend.type === 'up' && (
                <>
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <Badge variant="destructive" className="text-xs">
                    +{trend.percentage}%
                  </Badge>
                </>
              )}
              {trend.type === 'down' && (
                <>
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    -{trend.percentage}%
                  </Badge>
                </>
              )}
              {trend.type === 'neutral' && (
                <>
                  <Minus className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline" className="text-xs">
                    0%
                  </Badge>
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            {previousPeriod && previousLoading 
              ? "Calculando tendencia..." 
              : trend 
                ? `vs período anterior` 
                : "Período actual"
            }
          </p>
          
          <Button variant="ghost" size="sm" asChild className="h-6 px-2 text-xs">
            <Link href="/dashboard/incidentes" className="hover:text-primary">
              Ver detalles →
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}