"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Map from '@/components/ui/map';
import { MapPin, Loader2 } from 'lucide-react';
import { getIncidents } from '@/services/incident-service';
import { getOffice } from '@/services/office-service';
import { getIncidentTypeWithCache } from '@/services/incident-type-service';
import { getCompanyById } from '@/services/company-service';
import { Incident } from '@/types/incident';
import { getSafeImageUrl } from '@/lib/utils';

interface MapLocation {
  id: string | number;
  lat: number;
  lng: number;
  title: string;
  description: string;
  address?: string;
  logoUrl?: string;
  officeId?: string | number;
  incidentData?: {
    id: string;
    date: string;
    time: string;
    incidentType?: string;
    totalLoss?: string;
    suspectCount?: number;
    status?: string;
    severity?: 'low' | 'medium' | 'high';
  };
}

interface IncidentMapProps {
  fromDate?: string;
  toDate?: string;
  officeId?: string;
}

export function IncidentMap({ fromDate, toDate, officeId }: IncidentMapProps = {}) {
  const [loading, setLoading] = React.useState(true);
  const [locations, setLocations] = React.useState<MapLocation[]>([]);

  React.useEffect(() => {
    async function loadLocations() {
      try {
        setLoading(true);
        // 1. Obtener los últimos 10 incidentes con filtros
        const filters: {
          page_size: number;
          ordering: string;
          from_date?: string;
          to_date?: string;
          office?: string;
        } = { 
          page_size: 10,
          ordering: '-Date'
        };

        if (fromDate) filters.from_date = fromDate;
        if (toDate) filters.to_date = toDate;
        if (officeId) filters.office = officeId;

        const response = await getIncidents(filters);

        // 2. Para cada incidente, obtener los datos completos
        const locationPromises = response.results.map(async (incident: Incident) => {
          const officeId = typeof incident.Office === 'number' ? incident.Office : null;
          if (!officeId) return null;

          try {
            // Obtener datos de la oficina
            const office = await getOffice(officeId);
            if (!office?.Geo) return null;

            const [lat, lng] = office.Geo.split(',').map(Number);
            if (isNaN(lat) || isNaN(lng)) return null;

            // Obtener tipo de incidente
            let incidentTypeName = 'Tipo desconocido';
            if (incident.IncidentType) {
              try {
                const incidentType = await getIncidentTypeWithCache(incident.IncidentType);
                incidentTypeName = incidentType?.Name || 'Tipo desconocido';
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
                // Error loading incident type - using default value
              }
            }

            // Contar sospechosos
            let suspectCount = 0;
            if (incident.Suspects && Array.isArray(incident.Suspects)) {
              suspectCount = incident.Suspects.length;
            }

            // Obtener logo de la empresa
            let logoUrl = '';
            if (office.Company) {
              try {
                const company = await getCompanyById(office.Company.toString());
                logoUrl = company?.image_url || '';
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
                // Error loading company - using empty logo
              }
            }

            // Determinar la severidad basada en la pérdida total
            let severity: 'low' | 'medium' | 'high' = 'low';
            const totalLoss = parseFloat(incident.TotalLoss || '0');
            if (totalLoss > 1000000) severity = 'high';
            else if (totalLoss > 100000) severity = 'medium';

            return {
              id: incident.id,
              lat,
              lng,
              title: office.Name || 'Sucursal',
              description: office.Address || 'Dirección no disponible',
              address: office.Address,
              logoUrl: logoUrl ? getSafeImageUrl(logoUrl) || undefined : undefined,
              officeId: office.id,
              incidentData: {
                id: incident.id,
                date: incident.Date,
                time: incident.Time || '',
                incidentType: incidentTypeName,
                totalLoss: incident.TotalLoss || '0',
                suspectCount,
                status: 'Reportado',
                severity
              }
            };
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            // Error processing incident location
            return null;
          }
        });

        const locations = (await Promise.all(locationPromises)).filter((loc): loc is NonNullable<typeof loc> => loc !== null);
        setLocations(locations);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // Error loading locations
      } finally {
        setLoading(false);
      }
    }

    loadLocations();
  }, [fromDate, toDate, officeId]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex-none">
        <CardTitle>Últimos incidentes reportados</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col">
        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p className="text-sm font-medium">Cargando ubicaciones…</p>
          </div>
        ) : locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground">
            <MapPin className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm font-medium">No hay ubicaciones disponibles</p>
            <p className="text-xs">Verifica que las oficinas tengan coordenadas asignadas</p>
          </div>
        ) : (
          <div className="flex-1">
            <Map locations={locations} />
          </div>
        )}
      </CardContent>
    </Card>
  );
} 