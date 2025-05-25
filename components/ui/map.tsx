"use client"

import { useEffect, useRef } from "react"
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useTheme } from "next-themes"

interface MapLocation {
  id: string | number
  lat: number
  lng: number
  title: string
  address?: string
  logoUrl?: string
  officeId?: number
  popupContent?: string
}

interface MapProps {
  locations: MapLocation[]
}

export default function Map({ locations }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    mapboxgl.accessToken = "pk.eyJ1Ijoic2FtdWNhcmRlbmFzIiwiYSI6ImNreHJoazJtYTAzb2UyeG1wb2h6aHVrdXcifQ.Cm8Mhw8a8Q49AJzZ0aQmhg"

    if (mapRef.current) {
      const map = new mapboxgl.Map({
        container: mapRef.current,
        style: theme === 'dark' 
          ? 'mapbox://styles/mapbox/dark-v11'
          : 'mapbox://styles/mapbox/light-v11',
        center: locations[0] || [-57.3333, -25.2867], // Asunción por defecto
        zoom: 12,
      })

      locations.forEach((location) => {
        // Create custom marker element if logoUrl is provided
        let markerElement = undefined;
        
        if (location.logoUrl) {
          markerElement = document.createElement('div');
          markerElement.className = 'custom-marker';
          markerElement.style.width = '30px';
          markerElement.style.height = '30px';
          markerElement.style.borderRadius = '50%';
          markerElement.style.background = '#fff';
          markerElement.style.display = 'flex';
          markerElement.style.alignItems = 'center';
          markerElement.style.justifyContent = 'center';
          markerElement.style.border = '2px solid #0f172a';
          markerElement.style.overflow = 'hidden';
          
          const img = document.createElement('img');
          img.src = location.logoUrl;
          img.style.width = '80%';
          img.style.height = '80%';
          img.style.objectFit = 'contain';
          markerElement.appendChild(img);
        }
        
        // Create marker with or without custom element
        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat([location.lng, location.lat])
          
        // Set popup content if provided, otherwise use title
        const popupContent = location.popupContent || location.title;
        marker.setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent));
        
        marker.addTo(map);
      })

      return () => map.remove()
    }
  }, [locations, theme])

  return <div ref={mapRef} className="h-full w-full rounded-md" />
} 