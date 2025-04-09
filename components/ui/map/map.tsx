"use client"

import { useEffect, useRef } from "react"
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useTheme } from "next-themes"

interface MapProps {
  locations: {
    lat: number
    lng: number
    title: string
  }[]
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
        new mapboxgl.Marker()
          .setLngLat([location.lng, location.lat])
          .setPopup(new mapboxgl.Popup().setHTML(location.title))
          .addTo(map)
      })

      return () => map.remove()
    }
  }, [locations, theme])

  return <div ref={mapRef} className="h-full w-full rounded-md" />
} 