"use client";

import Map from "@/components/ui/map";
import { Incident } from "@/types/incident"; 
import { Office } from "@/types/office";
import { Company } from "@/types/company";
import { useIncidentsMap } from "@/hooks/useIncidentsMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, Building2, AlertTriangle } from "lucide-react";

interface IncidentsMapProps {
  incidents: Incident[];
  offices?: Office[];
  companies?: Company[];
  showStats?: boolean;
}

export function IncidentsMap({ 
  incidents, 
  offices = [], 
  companies = [], 
  showStats = false 
}: IncidentsMapProps) {
  
  const { mapLocations, stats, hasValidData } = useIncidentsMap({
    incidents,
    offices,
    companies
  });

  if (!hasValidData) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-md">
        <div className="text-center">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-gray-600">No hay incidentes con ubicaciones válidas para mostrar</p>
          <p className="text-sm text-gray-500 mt-1">
            {incidents.length > 0 
              ? `${incidents.length} incidentes sin coordenadas válidas`
              : "No hay incidentes para mostrar"
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalIncidents}</p>
                  <p className="text-xs text-muted-foreground">Incidentes mapeados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.uniqueOffices}</p>
                  <p className="text-xs text-muted-foreground">Sucursales afectadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">
                    Gs. {stats.totalLoss.toLocaleString('es-PY')}
                  </p>
                  <p className="text-xs text-muted-foreground">Pérdida total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div className="flex space-x-1">
                  <Badge variant="destructive" className="text-xs">
                    {stats.severityCount.high || 0} Alto
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {stats.severityCount.medium || 0} Medio
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Severidad</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="h-[500px] w-full">
        <Map locations={mapLocations} />
      </div>
    </div>
  );
}