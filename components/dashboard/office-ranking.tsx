"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Loader2, 
  BarChart3,
  DollarSign
} from "lucide-react";
import { useAllIncidents } from "@/hooks/useAllIncidents";
import { getAllOfficesComplete } from "@/services/office-service";
import { cityService } from "@/services/city-service";
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
  cityName: string;
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
  const [offices, setOffices] = React.useState<Office[]>([]);
  const [cities, setCities] = React.useState<Map<number, string>>(new Map());
  const [isLoadingOffices, setIsLoadingOffices] = React.useState(true);
  const [isLoadingCities, setIsLoadingCities] = React.useState(false);
  const [officesError, setOfficesError] = React.useState<Error | null>(null);


  // Get all incidents for the period
  const { 
    data: incidentsData, 
    isLoading: isLoadingIncidents, 
    error: incidentsError 
  } = useAllIncidents(fromDate, toDate, officeId);
  
  // Fetch offices and their cities
  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoadingOffices(true);
      setOfficesError(null);
      
      try {
        // 1. Fetch all offices first
        const allOffices = await getAllOfficesComplete();
        setOffices(allOffices);
        
        // 2. Get unique city IDs from offices
        const cityIds = [...new Set(allOffices.map(office => office.City).filter(Boolean))];
        
        if (cityIds.length > 0) {
          setIsLoadingCities(true);
          
          // 3. Fetch each city individually
          const cityMap = new Map<number, string>();
          const cityPromises = cityIds.map(async (cityId) => {
            try {
              const city = await cityService.getCity(cityId);
              
              // Store the city name, ensuring we have a valid name
              if (city && city.Name) {
                cityMap.set(cityId, city.Name);
              } else {
                cityMap.set(cityId, `Ciudad ${cityId}`); // Fallback
              }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error) {
              cityMap.set(cityId, `Ciudad ${cityId}`); // Fallback
            }
          });
          
          await Promise.all(cityPromises);
          setCities(cityMap);
          setIsLoadingCities(false);
        }
        
      } catch (error) {
        if (error instanceof Error) {
          setOfficesError(error);
        }
      } finally {
        setIsLoadingOffices(false);
        setIsLoadingCities(false);
      }
    };
    
    fetchData();
  }, []);



  // Calculate stats for ALL offices
  const allOfficeStats = React.useMemo(() => {
    if (!offices.length) return [];
    
    
    // Initialize stats for ALL offices
    const statsMap = new Map<number, OfficeStats>();
    
    // First, create entries for ALL offices with zero incidents
    offices.forEach((office: Office) => {
      if (office.id) {
        // Get city name from the cities map
        let cityName = cities.get(office.City);
        
        // If not found in cities map, try fallbacks
        if (!cityName) {
          if (office.Province) {
            cityName = office.Province;
          } else {
            cityName = `Ciudad ${office.City}`;
          }
        }
        
        
        statsMap.set(office.id, {
          id: office.id,
          name: office.Name || 'Sin nombre',
          code: office.Code || 'N/A',
          address: office.Address || 'Sin dirección',
          cityName: cityName,
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
  }, [incidentsData?.incidents, offices, cities]);

  // Always show top 3 offices
  const displayedOffices = React.useMemo(() => {
    return allOfficeStats.slice(0, 3);
  }, [allOfficeStats]);

  const officesWithIncidents = allOfficeStats.filter(o => o.incidentCount > 0);

  // Loading state
  if (isLoadingIncidents || isLoadingOffices || isLoadingCities) {
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
        <div className="space-y-4">
          {displayedOffices.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              No hay sucursales disponibles
            </div>
          ) : (
            displayedOffices.map((office, index) => (
              <div 
                key={office.id} 
                className="flex items-center gap-4 p-4 rounded-lg border bg-card/50 hover:bg-muted/50 transition-all duration-200 hover:shadow-md group"
              >
                {/* Ranking badge with unified color */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {index + 1}
                </div>
                
                {/* Office info */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Header with name and code */}
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-semibold truncate group-hover:text-primary transition-colors">
                      {office.name}
                    </h4>
                    <Badge variant="outline" className="text-xs font-medium">
                      {office.code}
                    </Badge>
                  </div>
                  
                  {/* City */}
                  <p className="text-sm text-muted-foreground font-medium">
                    📍 {office.cityName}
                  </p>
                  
                  {/* Address */}
                  <p className="text-xs text-muted-foreground truncate">
                    {office.address}
                  </p>
                  
                  {/* Stats row */}
                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-muted-foreground">Incidentes:</span>
                      </div>
                      <span className="text-sm font-semibold text-blue-600">{office.incidentCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-muted-foreground">Pérdidas:</span>
                      </div>
                      <span className="text-sm font-semibold text-red-600">{formatCurrency(office.totalLoss)}</span>
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