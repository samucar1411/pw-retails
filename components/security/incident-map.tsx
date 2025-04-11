"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

// Nota: Normalmente deberías usar variables de entorno para las claves API
// Este es solo un ejemplo y deberías reemplazar esto con tu token real de Mapbox
const MAPBOX_TOKEN = "pk.your_mapbox_token_here"

interface IncidentMapProps {
  period?: string
}

export function IncidentMap({ period = "Enero - Abril 2025" }: IncidentMapProps) {
  const mapContainer = React.useRef<HTMLDivElement>(null)
  const map = React.useRef<mapboxgl.Map | null>(null)
  
  React.useEffect(() => {
    if (!mapContainer.current) return
    
    // Inicializar el mapa solo si no existe ya
    if (map.current) return
    
    mapboxgl.accessToken = MAPBOX_TOKEN
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-57.6309, -25.3005], // Asunción, Paraguay como centro por defecto
      zoom: 11
    })
    
    // Añadir controles de navegación
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right")
    
    // Limpiar al desmontar
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [mapContainer])
  
  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Mapa de incidentes</CardTitle>
          <p className="text-sm text-muted-foreground">{period}</p>
        </div>
        <Button variant="outline" size="sm">
          Ver todos
        </Button>
      </CardHeader>
      <CardContent>
        <div 
          ref={mapContainer} 
          className="h-[400px] w-full rounded-md bg-muted/20"
        />
      </CardContent>
    </Card>
  )
}