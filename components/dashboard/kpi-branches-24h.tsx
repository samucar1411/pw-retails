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

  // Get unique offices from incidents
  const affectedOfficesCount = React.useMemo(() => {
    const uniqueOffices = new Set<number>();
    incidents.forEach(incident => {
      uniqueOffices.add(incident.Office);
    });
    return uniqueOffices.size;
  }, [incidents]);

  // Build link
  const incidentsLink = React.useMemo(() => {
    let link = `/dashboard/incidentes?Date_after=${fromDate24h}&Date_before=${toDate24h}`;
    if (officeId && officeId !== '') {
      link += `&Office=${officeId}`;
    }
    return link;
  }, [fromDate24h, toDate24h, officeId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sucursales afectadas (24h)</CardTitle>
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
          <CardTitle className="text-sm font-medium">Sucursales afectadas (24h)</CardTitle>
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
        <CardTitle className="text-sm font-medium">Sucursales afectadas (24h)</CardTitle>
        <Building2 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-2xl font-bold text-blue-600">{affectedOfficesCount}</div>
          
          <div className="text-xs text-muted-foreground">
            {incidents.length} incidente{incidents.length !== 1 ? 's' : ''} en las últimas 24 horas
          </div>
          
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