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

    locations.forEach((location) => {
      // Create simple popup
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(location.popupContent || `
          <div>
            <h3>${location.title}</h3>
            ${location.address ? `<p>${location.address}</p>` : ''}
          </div>
        `)

      // Create simple marker - NO custom element, use default
      new mapboxgl.Marker()
        .setLngLat([location.lng, location.lat])
        .setPopup(popup)
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

    return () => map.remove()
  }, [locations, mounted, currentTheme])

  return <div ref={mapRef} className="h-full w-full rounded-md" />
} 