"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { useIncidentsCount } from "@/hooks/useIncidentsCount";
import Link from "next/link";

interface KpiTotalIncidentsProps {
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
  
  // Calculate period duration in days
  const periodDuration = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Calculate previous period dates
  const prevTo = new Date(from);
  prevTo.setDate(prevTo.getDate() - 1);
  
  const prevFrom = new Date(prevTo);
  prevFrom.setDate(prevFrom.getDate() - periodDuration + 1);
  
  return {
    prevFrom: prevFrom.toISOString().slice(0, 10),
    prevTo: prevTo.toISOString().slice(0, 10)
  };
}

export function KpiTotalIncidents({ fromDate, toDate, officeId }: KpiTotalIncidentsProps) {
  // Current period incidents count from server
  const { 
    data: currentCount = 0, 
    isLoading: isLoadingCurrent, 
    error: errorCurrent 
  } = useIncidentsCount(fromDate, toDate, officeId);

  // Previous period incidents count - only when we have valid date range
  const previousPeriod: PreviousPeriod | null = React.useMemo(() => {
    return calculatePreviousPeriod(fromDate, toDate);
  }, [fromDate, toDate]);

  const { 
    data: previousCount = 0, 
    isLoading: isLoadingPrev, 
    error: errorPrev 
  } = useIncidentsCount(
    previousPeriod?.prevFrom || '',
    previousPeriod?.prevTo || '',
    officeId
  );

  // Type-safe incident counting - now using server counts directly
  const hasPreviousPeriod: boolean = previousPeriod !== null;

  // Calculate variation percentage
  const variationPercent = React.useMemo(() => {
    if (!hasPreviousPeriod) return 0;
    if (previousCount === 0) {
      return currentCount > 0 ? 100 : 0;
    }
    return ((currentCount - previousCount) / previousCount) * 100;
  }, [currentCount, previousCount, hasPreviousPeriod]);

  const isLoading = isLoadingCurrent || (hasPreviousPeriod && isLoadingPrev);
  const hasError = errorCurrent || (hasPreviousPeriod && errorPrev);

  // Build link to incidents page with filters
  const incidentsLink = React.useMemo(() => {
    const link = `/dashboard/incidentes`;
    const params = new URLSearchParams();
    
    if (fromDate && toDate && fromDate.trim() !== '' && toDate.trim() !== '') {
      params.append('Date_after', fromDate);
      params.append('Date_before', toDate);
    }
    
    if (officeId && officeId !== '') {
      params.append('Office', officeId);
    }
    
    const queryString = params.toString();
    return queryString ? `${link}?${queryString}` : link;
  }, [fromDate, toDate, officeId]);

  const getVariationDisplay = () => {
    if (variationPercent === 0) {
      return {
        icon: <Minus className="h-4 w-4" />,
        text: "0%",
        variant: "secondary" as const,
        color: "text-muted-foreground"
      };
    } else if (variationPercent > 0) {
      return {
        icon: <TrendingUp className="h-4 w-4" />,
        text: `+${variationPercent.toFixed(1)}%`,
        variant: "destructive" as const,
        color: "text-red-600"
      };
    } else {
      return {
        icon: <TrendingDown className="h-4 w-4" />,
        text: `${variationPercent.toFixed(1)}%`,
        variant: "default" as const,
        color: "text-green-600"
      };
    }
  };

  const variation = getVariationDisplay();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de incidentes</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm text-muted-foreground">Cargando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de incidentes</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">Error al cargar datos</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total de incidentes</CardTitle>
        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-2xl font-bold">{currentCount.toLocaleString()}</div>
          
          {hasPreviousPeriod ? (
            <div className="flex items-center justify-between">
              <Badge variant={variation.variant} className="flex items-center gap-1">
                {variation.icon}
                <span>{variation.text}</span>
              </Badge>
              <span className="text-xs text-muted-foreground">
                vs período anterior
              </span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Total de incidentes en el sistema
            </div>
          )}
          
          <div className="pt-2">
            <Link href={incidentsLink}>
              <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80">
                Ver incidentes →
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 