"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Building2, TrendingUp, Loader2 } from "lucide-react";
import { useAllIncidents } from "@/hooks/useAllIncidents";
import { getOffice } from "@/services/office-service";
import { Office } from "@/types/office";

interface OfficeRankingProps {
  fromDate: string;
  toDate: string;
  officeId: string;
}

interface OfficeStats {
  id: number;
  name: string;
  code: string;
  address: string;
  count: number;
  totalLoss: number;
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

export function OfficeRanking({ fromDate, toDate, officeId }: OfficeRankingProps) {
  const { 
    data: incidentsData, 
    isLoading, 
    error 
  } = useAllIncidents(fromDate, toDate, officeId);

  const incidents = incidentsData?.incidents || [];

  const [officeData, setOfficeData] = React.useState<Record<number, Office>>({});
  const [loadingOffices, setLoadingOffices] = React.useState(false);

  // Fetch office details for all unique offices in incidents
  React.useEffect(() => {
    const fetchOfficeData = async () => {
      if (!incidents.length) return;

      setLoadingOffices(true);
      const uniqueOfficeIds = [...new Set(incidents.map(inc => inc.Office))];
      const officePromises = uniqueOfficeIds.map(id => getOffice(id));

      try {
        const offices = await Promise.all(officePromises);
        const officeMap: Record<number, Office> = {};
        offices.forEach((office, index) => {
          if (office) {
            officeMap[uniqueOfficeIds[index]] = office;
          }
        });
        setOfficeData(officeMap);
      } catch (error) {
        console.error('Error fetching office data:', error);
      } finally {
        setLoadingOffices(false);
      }
    };

    fetchOfficeData();
  }, [incidents]);

  const { topByCount, topByLoss } = React.useMemo(() => {
    if (!incidents.length || loadingOffices) {
      return { topByCount: [], topByLoss: [] };
    }

    // Build office stats
    const officeStats: Record<number, OfficeStats> = {};
    
    incidents.forEach(incident => {
      const officeId = incident.Office;
      const office = officeData[officeId];
      
      if (!officeStats[officeId]) {
        officeStats[officeId] = {
          id: officeId,
          name: office?.Name || `Sucursal ${officeId}`,
          code: office?.Code || '',
          address: office?.Address || '',
          count: 0,
          totalLoss: 0
        };
      }
      
      officeStats[officeId].count++;
      officeStats[officeId].totalLoss += parseNumeric(incident.TotalLoss);
    });

    const officeArray = Object.values(officeStats);
    
    const topByCount = [...officeArray]
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    
    const topByLoss = [...officeArray]
      .sort((a, b) => b.totalLoss - a.totalLoss)
      .slice(0, 3);

    return { topByCount, topByLoss };
  }, [incidents, officeData, loadingOffices]);

  // If filtering by specific office, show message
  if (officeId && officeId !== '') {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Ranking de Oficinas
          </CardTitle>
          <CardDescription>Top 3 sucursales por incidentes y pérdidas totales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <Building2 className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm font-medium">Filtrado por una sucursal</p>
            <p className="text-xs">El ranking global no aplica</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || loadingOffices) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Ranking de Oficinas
          </CardTitle>
          <CardDescription>Top 3 sucursales por incidentes y pérdidas totales</CardDescription>
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
            <Building2 className="h-5 w-5" />
            Ranking de Oficinas
          </CardTitle>
          <CardDescription>Top 3 sucursales por incidentes y pérdidas totales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">Error al cargar datos de ranking</div>
        </CardContent>
      </Card>
    );
  }

  if (topByCount.length === 0) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Ranking de Oficinas
          </CardTitle>
          <CardDescription>Top 3 sucursales por incidentes y pérdidas totales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <Building2 className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm font-medium">Sin datos de ranking</p>
            <p className="text-xs">No hay incidentes en este período</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Ranking de Oficinas
        </CardTitle>
        <CardDescription>Top 3 sucursales por incidentes y pérdidas totales</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top by incident count */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20">
                <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Por incidentes</h4>
                <p className="text-xs text-muted-foreground">Cantidad de casos</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {topByCount.map((office, index) => (
                <div key={office.id} className="group relative">
                  <div className="flex items-center gap-3 p-3 rounded-xl border-2 bg-gradient-to-r from-background to-muted/20 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-sm shrink-0">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{office.name}</p>
                      {office.address && (
                        <p className="text-xs text-muted-foreground truncate">{office.address}</p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-red-600 dark:text-red-400">
                          {office.count}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">incidentes</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top by losses */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/20">
                <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Por pérdidas</h4>
                <p className="text-xs text-muted-foreground">Monto total</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {topByLoss.map((office, index) => (
                <div key={office.id} className="group relative">
                  <div className="flex items-center gap-3 p-3 rounded-xl border-2 bg-gradient-to-r from-background to-muted/20 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm shrink-0">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{office.name}</p>
                      {office.address && (
                        <p className="text-xs text-muted-foreground truncate">{office.address}</p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                          {formatCurrency(office.totalLoss)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">pérdidas</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 