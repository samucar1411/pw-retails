"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Map from '@/components/ui/map';
import { MapPin, Loader2 } from 'lucide-react';
import { getIncidents } from '@/services/incident-service';
import { getOffice } from '@/services/office-service';
import { Incident } from '@/types/incident';

interface MapLocation {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
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

        // 2. Para cada incidente, obtener los datos de su oficina
        const locationPromises = response.results.map(async (incident: Incident) => {
          const officeId = typeof incident.Office === 'number' ? incident.Office : null;
          if (!officeId) return null;

          const office = await getOffice(officeId);
          if (!office?.Geo) return null;

          const [lat, lng] = office.Geo.split(',').map(Number);
          if (isNaN(lat) || isNaN(lng)) return null;

          return {
            id: incident.id,
            lat,
            lng,
            title: office.Name || 'Sucursal',
            description: `${new Date(incident.Date).toLocaleDateString()} - ${incident.Description || ''}`
          };
        });

        const locations = (await Promise.all(locationPromises)).filter((loc): loc is MapLocation => loc !== null);
        setLocations(locations);
      } catch (error) {
        console.error('Error loading locations:', error);
      } finally {
        setLoading(false);
      }
    }

    loadLocations();
  }, [fromDate, toDate, officeId]);

  return (
    <Card className="lg:col-span-3 flex flex-col">
      <CardHeader className="flex-none">
        <CardTitle>Últimos incidentes reportados</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[450px] text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p className="text-sm font-medium">Cargando ubicaciones…</p>
          </div>
        ) : locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[450px] text-muted-foreground">
            <MapPin className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm font-medium">No hay ubicaciones disponibles</p>
            <p className="text-xs">Verifica que las oficinas tengan coordenadas asignadas</p>
          </div>
        ) : (
          <div className="h-[450px]">
            <Map locations={locations} />
          </div>
        )}
      </CardContent>
    </Card>
  );
} 