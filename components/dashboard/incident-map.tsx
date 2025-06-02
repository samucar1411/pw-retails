"use client";

import * as React from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, AlertCircle } from "lucide-react";
import { usePaginatedIncidents } from "@/hooks/usePaginatedIncidents";
import { useTheme } from "@/hooks/use-theme";
import { getOffice } from "@/services/office-service";
import { getIncidentType } from "@/services/incident-service";

// Initialize Mapbox
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

interface OfficeMapProps {
  fromDate: string;
  toDate: string;
  officeId: string;
}

export function OfficeMap({ fromDate, toDate, officeId }: OfficeMapProps) {
  const { 
    data: incidents = [], 
    isLoading: loading, 
    error 
  } = usePaginatedIncidents(fromDate, toDate, officeId);
  
  const [mapPage, setMapPage] = React.useState(1);
  const theme = useTheme();
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<mapboxgl.Map | null>(null);
  const markers = React.useRef<mapboxgl.Marker[]>([]);

  // Calculate visible incidents based on pagination
  const visibleCount = mapPage * 10;
  const visibleIncidents = React.useMemo(() => {
    return incidents.slice(0, visibleCount);
  }, [incidents, visibleCount]);

  const hasNextPage = visibleCount < incidents.length;

  // Handle zoom to fit all markers
  const onZoomToFit = React.useCallback(() => {
    if (!map.current || markers.current.length === 0) return;
    
    const bounds = new mapboxgl.LngLatBounds();
    markers.current.forEach(marker => {
      const lngLat = marker.getLngLat();
      bounds.extend([lngLat.lng, lngLat.lat]);
    });
    
    map.current.fitBounds(bounds, {
      padding: 50,
    });
  }, []);

  const loadNextPage = () => {
    if (hasNextPage) {
      setMapPage(prev => prev + 1);
    }
  };

  // Update map style when theme changes
  React.useEffect(() => {
    if (!map.current) return;
    
    const style = theme === 'dark' 
      ? 'mapbox://styles/mapbox/dark-v11' 
      : 'mapbox://styles/mapbox/light-v11';
    
    map.current.setStyle(style);
  }, [theme]);

  // Initialize map and set up controls
  React.useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') return;
    
    // Check if map container exists and map isn't already initialized
    if (!mapContainer.current || map.current) return;

    // Set map style based on theme
    const style = theme === 'dark' 
      ? 'mapbox://styles/mapbox/dark-v11' 
      : 'mapbox://styles/mapbox/light-v11';

    try {
      // Create new map instance
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style,
        center: [-57.6, -25.3],
        zoom: 6,
      });

      // Add navigation control
      newMap.addControl(new mapboxgl.NavigationControl());
      
      // Store the map instance
      map.current = newMap;
      
      // Handle map load
      newMap.on('load', () => {
      });
      
      // Cleanup function to prevent memory leaks
      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [theme]); // Recreate map when theme changes

  // Add markers for incidents
  React.useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') return;
    
    // Check if map is ready and we have incidents
    if (!map.current || loading || !visibleIncidents || visibleIncidents.length === 0) return;
    
    const currentMap = map.current;
    
    // Wait for map to be fully loaded before adding markers
    if (!currentMap.loaded()) {
      const onMapLoad = () => {
        currentMap.off('load', onMapLoad);
        // Retry adding markers after map is loaded
        setTimeout(() => {
          if (currentMap && visibleIncidents && visibleIncidents.length > 0) {
            addMarkersToMap(currentMap, visibleIncidents);
          }
        }, 100);
      };
      currentMap.on('load', onMapLoad);
      return;
    }
    
    addMarkersToMap(currentMap, visibleIncidents);
  }, [visibleIncidents, loading, onZoomToFit]);

  // Helper function to add markers to the map
  const addMarkersToMap = React.useCallback(async (currentMap: mapboxgl.Map, incidents: typeof visibleIncidents) => {
    try {
      const currentMarkers = [...markers.current];

      // Clear existing markers
      currentMarkers.forEach(marker => marker.remove());
      markers.current = [];

      // Add new markers for each visible incident
      for (const incident of incidents) {
        try {
          // Get office information
          const office = await getOffice(incident.Office);
          if (!office) continue;
          
          // Get incident type information
          const incidentType = await getIncidentType(incident.IncidentType);
          
          // Get coordinates from office
          let lng: number | null = null;
          let lat: number | null = null;

          if (office.Geo) {
            try {
              const parts = office.Geo.split(',');
              lat = parseFloat(parts[0]);
              lng = parseFloat(parts[1]);
            } catch (e) {
              console.error('Error parsing coordinates:', e);
              continue;
            }
          } else {
            console.warn('No coordinates available for office:', office.id);
            continue;
          }

          // Skip if coordinates are invalid
          if (!lat || !lng || isNaN(lng) || isNaN(lat)) {
            console.warn('Invalid coordinates for office:', office);
            continue;
          }
          
          // Create popup content with Tailwind classes
          const popupElement = document.createElement('div');
          popupElement.className = 'bg-card text-card-foreground rounded-lg shadow-lg border border-border w-72 overflow-hidden';
          
          popupElement.innerHTML = `
            <div class="bg-muted/50 p-4 border-b border-border">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-red-500"></div>
                <h3 class="text-lg font-semibold text-foreground">${office.Name}</h3>
              </div>
              <p class="text-sm text-muted-foreground mt-1">${office.Address || ''}</p>
            </div>
            <div class="p-4 space-y-3">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <p class="text-xs text-muted-foreground">Pérdida total</p>
                  <p class="text-sm font-medium">${incident.TotalLoss ? `GS ${Number(incident.TotalLoss).toLocaleString('es-PY')}` : 'GS 0'}</p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">Fecha</p>
                  <p class="text-sm">${incident.Date}</p>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <p class="text-xs text-muted-foreground">Hora</p>
                  <p class="text-sm">${incident.Time}</p>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">Tipo</p>
                  <p class="text-sm">${incidentType?.Name || 'No especificado'}</p>
                </div>
              </div>
              <div class="pt-2 border-t border-border">
                <p class="text-xs text-muted-foreground mb-1">Descripción</p>
                <p class="text-sm text-foreground">${incident.Description || 'Sin descripción'}</p>
              </div>
            </div>
          `;

          // Create a marker with dot and circle
          const el = document.createElement('div');
          el.className = 'relative w-6 h-6 flex items-center justify-center';
          el.innerHTML = `
            <div class="absolute w-3 h-3 bg-red-500 rounded-full"></div>
            <div class="absolute w-5 h-5 border-2 border-red-500 rounded-full animate-ping opacity-70"></div>
          `;

          // Create marker with popup - only add to map if it's ready
          if (currentMap && currentMap.getContainer() && currentMap.loaded()) {
            const marker = new mapboxgl.Marker(el)
              .setLngLat([lng, lat])
              .setPopup(
                new mapboxgl.Popup({ offset: 10 })
                  .setDOMContent(popupElement)
              )
              .addTo(currentMap);

            markers.current.push(marker);
          }
        } catch (error) {
          console.error('Error creating marker for incident:', incident, error);
        }
      }

      // Zoom to fit all markers
      if (markers.current.length > 0) {
        setTimeout(() => onZoomToFit(), 500); // Small delay to ensure markers are rendered
      }
    } catch (error) {
      console.error('Error adding markers to map:', error);
    }
  }, [onZoomToFit]);

  return (
    <Card className="lg:col-span-4 border-0 shadow-lg h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl font-bold">Mapa de Incidentes</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {loading ? 'Cargando incidentes...' : 
              `${visibleIncidents.length} de ${incidents.length} incidente${incidents.length !== 1 ? 's' : ''} en el mapa`}
          </CardDescription>
        </div>
        <Button 
          onClick={loadNextPage} 
          disabled={!hasNextPage}
          variant="outline"
          size="sm"
          className="ml-4"
        >
          {hasNextPage ? (
            'Cargar más'
          ) : (
            'Todos cargados'
          )}
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative">
        {/* Always render the map container, but show loading/error states on top when needed */}
        <div ref={mapContainer} className="w-full h-full min-h-[500px] rounded-lg overflow-hidden" />
        
        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Cargando mapa...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 bg-destructive/10 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="bg-background p-4 rounded-lg shadow-lg max-w-md text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-3">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-medium text-foreground">Error al cargar el mapa</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No se pudieron cargar los incidentes. Por favor, intente nuevamente.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Reintentar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Status indicators */}
      <div className="p-4 border-t">
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>{visibleIncidents.length} de {incidents.length} incidente{incidents.length !== 1 ? 's' : ''} mostrados</span>
          </div>
          <button 
            onClick={onZoomToFit}
            className="text-sm text-primary hover:underline flex items-center gap-1"
            disabled={visibleIncidents.length === 0}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Ver todos</span>
          </button>
        </div>
      </div>
    </Card>
  );
} 