"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  TrendingUp, 
  Loader2, 
  Eye,
  EyeOff,
  BarChart3,
  DollarSign,
  ExternalLink
} from "lucide-react";
import { useAllIncidents } from "@/hooks/useAllIncidents";
import { getAllOfficesComplete } from "@/services/office-service";
import { Office } from "@/types/office";
import { useRouter } from "next/navigation";

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
  incidentCount: number;
  totalLoss: number;
  avgLossPerIncident: number;
}

function parseNumeric(value: string | number | undefined): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return value;
  
  const numericString = value.toString().replace(/[^\d.-]/g, '');
  const parsed = parseFloat(numericString);
  return isNaN(parsed) ? 0 : parsed;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function OfficeRanking({ fromDate, toDate, officeId }: OfficeRankingProps) {
  const [showAll, setShowAll] = React.useState(false);
  const [offices, setOffices] = React.useState<Office[]>([]);
  const [isLoadingOffices, setIsLoadingOffices] = React.useState(true);
  const [officesError, setOfficesError] = React.useState<Error | null>(null);
  const router = useRouter();

  // Get all incidents for the period
  const { 
    data: incidentsData, 
    isLoading: isLoadingIncidents, 
    error: incidentsError 
  } = useAllIncidents(fromDate, toDate, officeId);
  
  // Fetch ALL offices directly from service (like incident-type-info.tsx does)
  React.useEffect(() => {
    const fetchAllOffices = async () => {
      setIsLoadingOffices(true);
      setOfficesError(null);
      
      try {
        const allOffices = await getAllOfficesComplete();
        setOffices(allOffices);
      } catch (error) {
        console.error("Error fetching all offices:", error);
        setOfficesError(error instanceof Error ? error : new Error("Error fetching offices"));
      } finally {
        setIsLoadingOffices(false);
      }
    };
    
    fetchAllOffices();
  }, []);

  // Handle office click
  const handleOfficeClick = (office: OfficeStats) => {
    router.push(`/dashboard/sucursales/${office.id}`);
  };

  // Calculate stats for ALL offices
  const allOfficeStats = React.useMemo(() => {
    if (!offices.length) return [];
    
    // Initialize stats for ALL offices
    const statsMap = new Map<number, OfficeStats>();
    
    // First, create entries for ALL offices with zero incidents
    offices.forEach((office: Office) => {
      if (office.id) {
        statsMap.set(office.id, {
          id: office.id,
          name: office.Name || 'Sin nombre',
          code: office.Code || 'N/A',
          address: office.Address || 'Sin dirección',
          incidentCount: 0,
          totalLoss: 0,
          avgLossPerIncident: 0,
        });
      }
    });
    
    // Then, update with actual incident data
    if (incidentsData?.incidents) {
      incidentsData.incidents.forEach((incident) => {
        const officeId = typeof incident.Office === 'number' 
          ? incident.Office 
          : typeof incident.Office === 'object' && incident.Office !== null 
            ? incident.Office.id 
            : null;
        if (!officeId) return;
        
        const existingStats = statsMap.get(officeId);
        if (!existingStats) return; // Skip if office not found in our list
        
        // Calculate incident loss
        const totalLossValue = incident.TotalLoss;
        const cashLoss = parseNumeric(incident.CashLoss);
        const merchandiseLoss = parseNumeric(incident.MerchandiseLoss);
        const otherLosses = parseNumeric(incident.OtherLosses);
        const calculatedTotal = cashLoss + merchandiseLoss + otherLosses;
        
        let incidentLoss = 0;
        if (totalLossValue) {
          incidentLoss = parseNumeric(totalLossValue);
        } else {
          incidentLoss = calculatedTotal;
        }
        
        // Update stats
        existingStats.incidentCount += 1;
        existingStats.totalLoss += incidentLoss;
        existingStats.avgLossPerIncident = existingStats.totalLoss / existingStats.incidentCount;
      });
    }
    
    const officeStatsArray = Array.from(statsMap.values());
    
    // Sort by incidents (descending)
    const sortedByIncidents = [...officeStatsArray].sort((a, b) => b.incidentCount - a.incidentCount);
    
    return sortedByIncidents; // Return sorted by incidents by default
  }, [incidentsData?.incidents, offices, fromDate, toDate]);

  // Get offices to display (top 3 by default, offices with incidents if showAll is true)
  const displayedOffices = React.useMemo(() => {
    if (showAll) {
      // Show only offices with incidents, sorted by incident count
      return allOfficeStats.filter(office => office.incidentCount > 0);
    }
    // Show top 3 regardless of incident count
    return allOfficeStats.slice(0, 3);
  }, [allOfficeStats, showAll]);

  const officesWithIncidents = allOfficeStats.filter(o => o.incidentCount > 0);

  // Loading state
  if (isLoadingIncidents || isLoadingOffices) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Ranking de Sucursales
          </CardTitle>
          <CardDescription>Comparación de todas las sucursales</CardDescription>
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
            Ranking de Sucursales
          </CardTitle>
          <CardDescription>Comparación de todas las sucursales</CardDescription>
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
          Ranking de Sucursales
        </CardTitle>
        <CardDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>Top 3 sucursales por número de incidentes</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {allOfficeStats.length} sucursales
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {officesWithIncidents.length} con incidentes
            </Badge>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`space-y-3 ${showAll ? 'max-h-96 overflow-y-auto pr-2' : ''}`}>
          {displayedOffices.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              No hay sucursales disponibles
            </div>
          ) : (
            displayedOffices.map((office, index) => (
              <div 
                key={office.id} 
                className="flex items-center gap-3 p-4 rounded-lg border bg-card/50 hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:shadow-md group"
                onClick={() => handleOfficeClick(office)}
              >
                {/* Ranking number */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-gray-400' : 
                  index === 2 ? 'bg-amber-600' : 
                  'bg-gray-500'
                }`}>
                  {index + 1}
                </div>
                
                {/* Office info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{office.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {office.code}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mb-2">{office.address}</p>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3 text-blue-500" />
                      <span className="text-muted-foreground">Incidentes:</span>
                      <span className="font-medium">{office.incidentCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-red-500" />
                      <span className="text-muted-foreground">Pérdidas:</span>
                      <span className="font-medium">{formatCurrency(office.totalLoss)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Main metric and click indicator */}
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-2xl font-bold">{office.incidentCount}</div>
                      <div className="text-xs text-muted-foreground">incidentes</div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      {office.incidentCount > 0 ? (
                        <TrendingUp className="h-5 w-5 text-red-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        </div>
                      )}
                      <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Show more/less button */}
        {officesWithIncidents.length > 3 && (
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2"
            >
              {showAll ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showAll ? 'Mostrar menos' : `Ver todas con incidentes (${officesWithIncidents.length})`}
            </Button>
            
            <Badge variant="secondary" className="text-xs">
              Mostrando {displayedOffices.length} de {officesWithIncidents.length} con incidentes
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 