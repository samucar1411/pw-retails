"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Loader2 } from "lucide-react";
import { usePaginatedIncidents } from "@/hooks/usePaginatedIncidents";
import Link from "next/link";

interface KpiBranches24hProps {
  officeId: string;
}

export function KpiBranches24h({ officeId }: KpiBranches24hProps) {
  // Calculate 24h period
  const { fromDate24h, toDate24h } = React.useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    return {
      fromDate24h: yesterday.toISOString().slice(0, 10),
      toDate24h: today.toISOString().slice(0, 10)
    };
  }, []);

  const { 
    data: incidents = [], 
    isLoading, 
    error 
  } = usePaginatedIncidents(fromDate24h, toDate24h, officeId);

  // Calculate the main metric based on whether office filter is applied
  const { mainCount, title, description } = React.useMemo(() => {
    if (officeId && officeId !== '') {
      // When office filter is applied, show incident count for that office
      return {
        mainCount: incidents.length,
        title: 'Incidentes (24h)',
        description: `en la sucursal seleccionada`
      };
    } else {
      // When no office filter, show unique affected offices count
      const uniqueOffices = new Set<number>();
      incidents.forEach(incident => {
        const incidentOfficeId = typeof incident.Office === 'number' 
          ? incident.Office 
          : typeof incident.Office === 'object' && incident.Office !== null 
            ? incident.Office.id 
            : null;
        if (incidentOfficeId !== null) {
          uniqueOffices.add(incidentOfficeId);
        }
      });
      return {
        mainCount: uniqueOffices.size,
        title: 'Sucursales afectadas (24h)',
        description: `${incidents.length} incidente${incidents.length !== 1 ? 's' : ''} en las últimas 24 horas`
      };
    }
  }, [incidents, officeId]);

  // Build link using URLSearchParams like the suspects KPI
  const incidentsLink = React.useMemo(() => {
    const link = `/dashboard/incidentes`;
    const params = new URLSearchParams();
    
    // Add date filters for 24h period
    params.append('Date_after', fromDate24h);
    params.append('Date_before', toDate24h);
    
    // Add office filter if present
    if (officeId && officeId !== '') {
      params.append('Office', officeId);
    }
    
    const queryString = params.toString();
    return queryString ? `${link}?${queryString}` : link;
  }, [fromDate24h, toDate24h, officeId]);

  const loadingTitle = (officeId && officeId !== '') ? 'Incidentes (24h)' : 'Sucursales afectadas (24h)';

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{loadingTitle}</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
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

  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{loadingTitle}</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
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
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Building2 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-2xl font-bold text-blue-600">{mainCount}</div>
          
          <div className="text-xs text-muted-foreground">
            {description}
          </div>
          
          <div className="pt-2">
            <Link href={incidentsLink}>
              <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80">
                Ver incidentes 24h →
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 