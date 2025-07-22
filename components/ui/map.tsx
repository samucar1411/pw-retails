"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useTheme } from "next-themes"

interface MapLocation {
  id: string | number
  lat: number
  lng: number
  title: string
  description: string
}

interface MapProps {
  locations: MapLocation[]
}

export default function Map({ locations }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = mounted ? (resolvedTheme || theme) : 'light'

  useEffect(() => {
    if (!mapRef.current || !mounted) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "pk.eyJ1Ijoic2FtdWNhcmRlbmFzIiwiYSI6ImNreHJoazJtYTAzb2UyeG1wb2h6aHVrdXcifQ.Cm8Mhw8a8Q49AJzZ0aQmhg"

    const mapStyle = currentTheme === 'dark' 
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/light-v11'

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: mapStyle,
      center: locations.length > 0 ? [locations[0].lng, locations[0].lat] : [-57.3333, -25.2867],
      zoom: locations.length > 1 ? 10 : 12,
    })

    // Esperar a que el mapa cargue para agregar los marcadores
    map.on('load', () => {
      // Agregar el source y layer para los marcadores pulsantes
      map.addSource('points', {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': locations.map(location => ({
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': [location.lng, location.lat]
            },
            'properties': {
              'id': location.id,
              'title': location.title,
              'description': location.description
            }
          }))
        }
      });

      // Agregar el círculo base
      map.addLayer({
        'id': 'points',
        'type': 'circle',
        'source': 'points',
        'paint': {
          'circle-radius': 8,
          'circle-color': '#ff0000',
          'circle-opacity': 0.6
        }
      });

      // Agregar el efecto pulsante
      map.addLayer({
        'id': 'points-pulse',
        'type': 'circle',
        'source': 'points',
        'paint': {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'pulse'],
            0, 8,
            1, 16
          ],
          'circle-color': '#ff0000',
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['get', 'pulse'],
            0, 0.4,
            1, 0
          ]
        }
      });

      // Crear popups
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: true
      });

      // Mostrar popup al hacer click
      map.on('click', 'points', (e) => {
        const feature = e.features?.[0];
        if (!feature || !feature.geometry || feature.geometry.type !== 'Point') return;
        
        const coordinates = feature.geometry.coordinates.slice() as [number, number];
        const properties = feature.properties as { title: string; description: string } | null;
        if (!properties) return;
        
        const { title, description } = properties;
        
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        
        popup
          .setLngLat(coordinates)
          .setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">${title}</h3>
              <p class="text-sm mt-1">${description}</p>
            </div>
          `)
          .addTo(map);
      });

      // Cambiar el cursor al pasar sobre los puntos
      map.on('mouseenter', 'points', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      
      map.on('mouseleave', 'points', () => {
        map.getCanvas().style.cursor = '';
      });

      // Animar los puntos
      let animationFrame: number;
      let start = 0;

      function animate(timestamp: number) {
        if (!start) start = timestamp;
        const progress = (timestamp - start) / 1500; // 1.5 segundos por ciclo

        locations.forEach(location => {
          map.setFeatureState(
            { source: 'points', id: location.id },
            { pulse: (Math.sin(progress * Math.PI * 2) + 1) / 2 }
          );
        });

        animationFrame = requestAnimationFrame(animate);
      }

      animationFrame = requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(animationFrame);
      };
    });

    // Fit map to show all markers if there are multiple locations
    if (locations.length > 1) {
      const bounds = new mapboxgl.LngLatBounds()
      locations.forEach(location => {
        bounds.extend([location.lng, location.lat])
      })
      map.fitBounds(bounds, { padding: 50 })
    }

    return () => map.remove()
  }, [locations, mounted, currentTheme])

  return <div ref={mapRef} className="h-full w-full rounded-md" />
} 