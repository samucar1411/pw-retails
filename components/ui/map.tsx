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
  const [mounted, setMounted] = useState(false)

  // Set mounted to true after component mounts to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Get the current theme, defaulting to light if not mounted yet
  const currentTheme = mounted ? (resolvedTheme || theme) : 'light'

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !mounted) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "pk.eyJ1Ijoic2FtdWNhcmRlbmFzIiwiYSI6ImNreHJoazJtYTAzb2UyeG1wb2h6aHVrdXcifQ.Cm8Mhw8a8Q49AJzZ0aQmhg"

    // Choose map style based on theme
    const mapStyle = currentTheme === 'dark' 
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/light-v11'

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: mapStyle,
      center: locations.length > 0 ? [locations[0].lng, locations[0].lat] : [-57.3333, -25.2867],
      zoom: locations.length > 1 ? 10 : 12,
      attributionControl: false // Remove attribution for cleaner look
    })

    // Add navigation control
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Store map instance
    mapInstance.current = map

    // Add markers after map loads
    map.on('load', () => {
      addMarkers(map, locations, currentTheme || 'light')
    })

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [locations, mounted, currentTheme])

  // Update map style when theme changes
  useEffect(() => {
    if (!mapInstance.current || !mounted) return

    const mapStyle = currentTheme === 'dark' 
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/light-v11'

    mapInstance.current.setStyle(mapStyle)

    // Re-add markers after style change
    mapInstance.current.once('styledata', () => {
      if (mapInstance.current) {
        addMarkers(mapInstance.current, locations, currentTheme || 'light')
      }
    })
  }, [currentTheme, locations, mounted])

  const addMarkers = (map: mapboxgl.Map, locations: MapLocation[], currentTheme: string) => {
    locations.forEach((location) => {
      // Create custom marker element
      const markerElement = document.createElement('div')
      markerElement.className = 'custom-marker'
      markerElement.style.width = '32px'
      markerElement.style.height = '32px'
      markerElement.style.borderRadius = '50%'
      markerElement.style.display = 'flex'
      markerElement.style.alignItems = 'center'
      markerElement.style.justifyContent = 'center'
      markerElement.style.cursor = 'pointer'
      markerElement.style.transition = 'transform 0.2s ease'
      
      // Style marker based on theme and whether it has a logo
      if (location.logoUrl) {
        markerElement.style.background = currentTheme === 'dark' ? '#1f2937' : '#ffffff'
        markerElement.style.border = `2px solid ${currentTheme === 'dark' ? '#374151' : '#e5e7eb'}`
        markerElement.style.boxShadow = currentTheme === 'dark' 
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        markerElement.style.overflow = 'hidden'
        
        const img = document.createElement('img')
        img.src = location.logoUrl
        img.style.width = '80%'
        img.style.height = '80%'
        img.style.objectFit = 'contain'
        img.style.borderRadius = '50%'
        markerElement.appendChild(img)
      } else {
        // Default marker without logo
        markerElement.style.background = currentTheme === 'dark' ? '#3b82f6' : '#2563eb'
        markerElement.style.border = `2px solid ${currentTheme === 'dark' ? '#1e40af' : '#1d4ed8'}`
        markerElement.style.boxShadow = currentTheme === 'dark' 
          ? '0 4px 6px -1px rgba(59, 130, 246, 0.3)' 
          : '0 4px 6px -1px rgba(37, 99, 235, 0.3)'
        
        // Add a small circle inside
        const innerCircle = document.createElement('div')
        innerCircle.style.width = '12px'
        innerCircle.style.height = '12px'
        innerCircle.style.borderRadius = '50%'
        innerCircle.style.background = '#ffffff'
        markerElement.appendChild(innerCircle)
      }

      // Add hover effect
      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.transform = 'scale(1.1)'
      })
      
      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.transform = 'scale(1)'
      })

      // Create themed popup content
      const popupContent = location.popupContent || `
        <div style="
          background: ${currentTheme === 'dark' ? '#1f2937' : '#ffffff'};
          color: ${currentTheme === 'dark' ? '#f9fafb' : '#111827'};
          padding: 12px;
          border-radius: 8px;
          font-family: system-ui, -apple-system, sans-serif;
          border: 1px solid ${currentTheme === 'dark' ? '#374151' : '#e5e7eb'};
          box-shadow: ${currentTheme === 'dark' 
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' 
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'};
        ">
          <h3 style="
            font-weight: 600;
            margin: 0 0 8px 0;
            font-size: 14px;
            color: ${currentTheme === 'dark' ? '#f9fafb' : '#111827'};
          ">${location.title}</h3>
          ${location.address ? `
            <p style="
              margin: 0;
              font-size: 12px;
              color: ${currentTheme === 'dark' ? '#d1d5db' : '#6b7280'};
            ">${location.address}</p>
          ` : ''}
        </div>
      `

      // Create marker with themed popup
      new mapboxgl.Marker(markerElement)
        .setLngLat([location.lng, location.lat])
        .setPopup(
          new mapboxgl.Popup({ 
            offset: 25,
            className: currentTheme === 'dark' ? 'mapbox-popup-dark' : 'mapbox-popup-light'
          }).setHTML(popupContent)
        )
        .addTo(map)
    })

    // Fit map to show all markers if there are multiple locations
    if (locations.length > 1) {
      const bounds = new mapboxgl.LngLatBounds()
      locations.forEach(location => {
        bounds.extend([location.lng, location.lat])
      })
      map.fitBounds(bounds, { padding: 50 })
    }
  }

  return (
    <div className="h-full w-full rounded-md overflow-hidden">
      <div ref={mapRef} className="h-full w-full" />
      <style jsx global>{`
        .mapbox-popup-dark .mapboxgl-popup-content {
          background: #1f2937 !important;
          color: #f9fafb !important;
          border: 1px solid #374151 !important;
        }
        .mapbox-popup-dark .mapboxgl-popup-tip {
          border-top-color: #1f2937 !important;
        }
        .mapbox-popup-light .mapboxgl-popup-content {
          background: #ffffff !important;
          color: #111827 !important;
          border: 1px solid #e5e7eb !important;
        }
        .mapbox-popup-light .mapboxgl-popup-tip {
          border-top-color: #ffffff !important;
        }
        .mapboxgl-popup-close-button {
          color: ${currentTheme === 'dark' ? '#f9fafb' : '#111827'} !important;
          font-size: 20px !important;
        }
      `}</style>
    </div>
  )
} 