"use client";

import * as React from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Office } from "@/types/office";
import { MapPin } from "lucide-react";
import { PaginatedResponse } from "@/types/api";

// Initialize Mapbox
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

interface OfficeMapProps {
  data: Office[] | PaginatedResponse<Office>;
}

export function OfficeMap({ data }: OfficeMapProps) {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<mapboxgl.Map | null>(null);
  const markers = React.useRef<mapboxgl.Marker[]>([]);

  const officesWithCoordinates = React.useMemo(() => {
    if (!data) return [];
    
    // Handle both paginated response and direct array
    const officesArray: Office[] = 'results' in data 
      ? data.results 
      : Array.isArray(data) 
        ? data 
        : [];
    
    return officesArray.filter((office: Office) => {
      if (!office?.Geo) return false;
      const parts = office.Geo.split(",");
      if (parts.length !== 2) return false;
      const lat = parseFloat(parts[0].trim());
      const lon = parseFloat(parts[1].trim());
      return !isNaN(lat) && !isNaN(lon);
    });
  }, [data]);

  const isEmpty = officesWithCoordinates.length === 0;

  React.useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-57.5759, -25.2637],
      zoom: 6,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    const currentMap = map.current;
    if (!currentMap || isEmpty) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for each office
    officesWithCoordinates.forEach(office => {
      if (!office.Geo) return;

      const parts = office.Geo.split(",");
      const lat = parseFloat(parts[0].trim());
      const lon = parseFloat(parts[1].trim());

      if (isNaN(lat) || isNaN(lon)) return;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-bold">${office.Name} (${office.Code})</h3>
          <p class="text-sm">${office.Address}</p>
          <p class="text-sm">Provincia: ${office.Province}</p>
          ${office.Phone ? `<p class="text-sm">Tel: ${office.Phone}</p>` : ""}
          ${office.Mobile ? `<p class="text-sm">Móvil: ${office.Mobile}</p>` : ""}
        </div>
      `);

      // Create custom marker element
      const el = document.createElement('div');
      el.style.backgroundImage = 'url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1XsoVtjaQs2k4pJeWnvcmnrxWCkci0HUfoQ&s'; // ensure office-marker.png exists in public folder
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.backgroundSize = 'contain';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.cursor = 'pointer';
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lon, lat])
        .setPopup(popup)
        .addTo(currentMap);

      markers.current.push(marker);
    });

  }, [officesWithCoordinates, isEmpty]);

  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle>Mapa de Oficinas</CardTitle>
        <CardDescription>Ubicación de las oficinas registradas</CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <MapPin className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm font-medium">No hay oficinas con ubicación</p>
            <p className="text-xs">No se han registrado oficinas con coordenadas válidas</p>
          </div>
        ) : (
          <div ref={mapContainer} className="h-[300px] rounded-md" />
        )}
      </CardContent>
    </Card>
  );
} 