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
        
        // Add fallback office icon if image fails to load
        img.onerror = () => {
          img.style.display = 'none'
          const officeIcon = document.createElement('div')
          officeIcon.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 21V7L9 3L15 7V21H3Z" stroke="${currentTheme === 'dark' ? '#9ca3af' : '#6b7280'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 9V13" stroke="${currentTheme === 'dark' ? '#9ca3af' : '#6b7280'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 17H9.01" stroke="${currentTheme === 'dark' ? '#9ca3af' : '#6b7280'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13 9V13" stroke="${currentTheme === 'dark' ? '#9ca3af' : '#6b7280'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13 17H13.01" stroke="${currentTheme === 'dark' ? '#9ca3af' : '#6b7280'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          `
          officeIcon.style.display = 'flex'
          officeIcon.style.alignItems = 'center'
          officeIcon.style.justifyContent = 'center'
          markerElement.appendChild(officeIcon)
        }
        
        markerElement.appendChild(img)
      } else {
        // Default marker with office icon
        markerElement.style.background = currentTheme === 'dark' ? '#1f2937' : '#ffffff'
        markerElement.style.border = `2px solid ${currentTheme === 'dark' ? '#374151' : '#e5e7eb'}`
        markerElement.style.boxShadow = currentTheme === 'dark' 
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        
        // Add office building icon
        const officeIcon = document.createElement('div')
        officeIcon.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 21V7L9 3L15 7V21H3Z" stroke="${currentTheme === 'dark' ? '#3b82f6' : '#2563eb'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 9V13" stroke="${currentTheme === 'dark' ? '#3b82f6' : '#2563eb'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 17H9.01" stroke="${currentTheme === 'dark' ? '#3b82f6' : '#2563eb'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13 9V13" stroke="${currentTheme === 'dark' ? '#3b82f6' : '#2563eb'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13 17H13.01" stroke="${currentTheme === 'dark' ? '#3b82f6' : '#2563eb'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `
        officeIcon.style.display = 'flex'
        officeIcon.style.alignItems = 'center'
        officeIcon.style.justifyContent = 'center'
        markerElement.appendChild(officeIcon)
      }

      // Create themed popup content
      const popupContent = location.popupContent || `
        <div class="mapbox-popup-content-inner">
          <h3 class="mapbox-popup-title">${location.title}</h3>
          ${location.address ? `<p class="mapbox-popup-address">${location.address}</p>` : ''}
        </div>
      `

      // Create marker with themed popup - use default Mapbox behavior
      new mapboxgl.Marker({
        element: markerElement,
        draggable: false // Explicitly disable dragging
      })
        .setLngLat([location.lng, location.lat])
        .setPopup(
          new mapboxgl.Popup({ 
            offset: 25,
            className: `mapbox-popup-themed ${currentTheme === 'dark' ? 'mapbox-popup-dark' : 'mapbox-popup-light'}`
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