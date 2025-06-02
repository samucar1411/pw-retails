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
  const mapInstance = useRef<mapboxgl.Map | null>(null)
  const { theme, resolvedTheme } = useTheme()

  // Get the current theme, defaulting to light if system
  const currentTheme = theme === 'system' ? resolvedTheme : theme

  // Initialize map only once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    mapboxgl.accessToken = "pk.eyJ1Ijoic2FtdWNhcmRlbmFzIiwiYSI6ImNreHJoazJtYTAzb2UyeG1wb2h6aHVrdXcifQ.Cm8Mhw8a8Q49AJzZ0aQmhg"

    const initialStyle = currentTheme === 'dark' 
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/light-v11'

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: initialStyle,
      center: locations.length > 0 
        ? [locations[0].lng, locations[0].lat] 
        : [-57.3333, -25.2867], // Asunción por defecto
      zoom: 12,
    })

    mapInstance.current = map

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, []) // Only run once on mount

  // Update map style when theme changes
  useEffect(() => {
    if (!mapInstance.current) return
    
    const newStyle = currentTheme === 'dark' 
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/light-v11'
    
    // Only update style if it's different
    if (mapInstance.current.getStyle().name !== newStyle) {
      mapInstance.current.setStyle(newStyle)
    }
  }, [currentTheme])

  // Update markers when locations change
  useEffect(() => {
    if (!mapInstance.current || !locations.length) return

    const map = mapInstance.current

    // Wait for map to be loaded before adding markers
    const addMarkers = () => {
      // Clear existing markers by removing all markers
      // Note: Mapbox doesn't have a direct way to remove all markers, 
      // so we'll need to keep track of them or recreate as needed
      
      locations.forEach((location) => {
        // Create custom marker element if logoUrl is provided
        let markerElement = undefined;
        
        if (location.logoUrl) {
          markerElement = document.createElement('div');
          markerElement.className = 'custom-marker';
          markerElement.style.width = '30px';
          markerElement.style.height = '30px';
          markerElement.style.borderRadius = '50%';
          markerElement.style.background = currentTheme === 'dark' ? '#1f2937' : '#ffffff';
          markerElement.style.display = 'flex';
          markerElement.style.alignItems = 'center';
          markerElement.style.justifyContent = 'center';
          markerElement.style.border = `2px solid ${currentTheme === 'dark' ? '#374151' : '#0f172a'}`;
          markerElement.style.overflow = 'hidden';
          markerElement.style.boxShadow = currentTheme === 'dark' 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          
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
          
        // Create popup with theme-aware styling
        const popupContent = location.popupContent || 
          `<div class="p-3 ${currentTheme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-md">
             <div class="font-bold mb-1 ${currentTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}">${location.title}</div>
             ${location.address ? `<div class="text-sm mb-2 ${currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}">${location.address}</div>` : ''}
           </div>`;
        
        marker.setPopup(
          new mapboxgl.Popup({ 
            offset: 25,
            className: currentTheme === 'dark' ? 'mapbox-popup-dark' : 'mapbox-popup-light'
          }).setHTML(popupContent)
        );
        
        marker.addTo(map);
      })

      // Fit map to show all markers if multiple locations
      if (locations.length > 1) {
        const bounds = new mapboxgl.LngLatBounds()
        locations.forEach(location => {
          bounds.extend([location.lng, location.lat])
        })
        map.fitBounds(bounds, { padding: 50 })
      }
    }

    if (map.loaded()) {
      addMarkers()
    } else {
      map.on('load', addMarkers)
    }
  }, [locations, currentTheme])

  return <div ref={mapRef} className="h-full w-full rounded-md" />
} 