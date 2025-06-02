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
import { useOffice } from "@/context/office-context";
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
  
  const numericString = value.toString().replace(/[^\d.-]/g, '');
  const parsed = parseFloat(numericString);
  return isNaN(parsed) ? 0 : parsed;
}

export function OfficeRanking({ fromDate, toDate, officeId }: OfficeRankingProps) {
  // Use shared incident data - this reuses the same cache as other components
  const { 
    data: incidentsData, 
    isLoading: isLoadingIncidents, 
    error: incidentsError 
  } = useAllIncidents(fromDate, toDate, officeId);
  
  // Use the existing office context - this is cached and shared
  const { 
    offices = [], 
    isLoading: isLoadingOffices,
    error: officesError 
  } = useOffice();

  // Memoized calculation to avoid re-processing on every render
  const officeStats = React.useMemo(() => {
    if (!incidentsData?.incidents || !offices.length) return [];
    
    // Create office lookup map for O(1) access
    const officeMap = new Map<number, Office>();
    offices.forEach((office: Office) => {
      if (office.id) {
        officeMap.set(office.id, office);
      }
    });
    
    // Group incidents by office efficiently
    const statsMap = new Map<number, OfficeStats>();
    
    incidentsData.incidents.forEach((incident) => {
      // Use the correct field name from Incident type
      const officeId = incident.Office || incident.officeId;
      if (!officeId) return;
      
      const office = officeMap.get(officeId);
      if (!office) return;
      
      const currentStats = statsMap.get(officeId);
      
      // Try multiple strategies to get the loss value
      const totalLossValue = incident.TotalLoss as string | undefined;
      const montoEstimadoValue = incident.MontoEstimado as string | undefined;
      const cashLoss = parseNumeric(incident.CashLoss);
      const merchandiseLoss = parseNumeric(incident.MerchandiseLoss);
      const otherLosses = parseNumeric(incident.OtherLosses);
      const calculatedTotal = cashLoss + merchandiseLoss + otherLosses;
      
      let incidentLoss = 0;
      if (totalLossValue) {
        incidentLoss = parseNumeric(totalLossValue);
      } else if (montoEstimadoValue) {
        incidentLoss = parseNumeric(montoEstimadoValue);
      } else {
        // Calculate from individual components
        incidentLoss = calculatedTotal;
      }
      
      if (currentStats) {
        currentStats.count += 1;
        currentStats.totalLoss += incidentLoss;
      } else {
        statsMap.set(officeId, {
          id: officeId,
          name: office.Name || 'Sin nombre',
          code: office.Code || 'N/A',
          address: office.Address || 'Sin dirección',
          count: 1,
          totalLoss: incidentLoss,
        });
      }
    });
    
    return Array.from(statsMap.values())
      .sort((a, b) => b.totalLoss - a.totalLoss)
      .slice(0, 5);
  }, [incidentsData?.incidents, offices]);

  // Loading state
  if (isLoadingIncidents || isLoadingOffices) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Ranking de Oficinas
          </CardTitle>
          <CardDescription>Oficinas con mayores pérdidas económicas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">
              Cargando ranking...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (incidentsError || officesError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Ranking de Oficinas
          </CardTitle>
          <CardDescription>Oficinas con mayores pérdidas económicas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-muted-foreground py-8">
            Error al cargar los datos del ranking
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Ranking de Oficinas
        </CardTitle>
        <CardDescription>Oficinas con mayores pérdidas económicas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 sm:space-y-3">
          {officeStats.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              No hay datos disponibles para el período seleccionado
            </div>
          ) : (
            officeStats.map((office, index) => (
              <div key={office.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border bg-card/50 hover:bg-muted/30 transition-colors">
                <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white ${
                  index === 0 ? 'bg-red-500' : 
                  index === 1 ? 'bg-orange-500' : 
                  index === 2 ? 'bg-yellow-500' : 'bg-gray-500'
                }`}>
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium truncate">{office.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">{office.address}</p>
                    </div>
                    
                    <div className="text-right ml-2">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <TrendingUp className="h-3 w-3 text-red-500" />
                        Gs {office.totalLoss.toLocaleString('es-PY')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {office.count} {office.count === 1 ? 'incidente' : 'incidentes'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
} 