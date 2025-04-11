"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface IncidentHeatmapProps {
  data?: Array<{
    day: string
    hour: number
    intensity: number
  }>
}

export function IncidentHeatmap({ data }: IncidentHeatmapProps) {
  // Si no se proporcionan datos, generamos datos de ejemplo
  const heatmapData = React.useMemo(() => {
    if (data) return data
    
    // Generar datos de ejemplo para el heatmap
    const days = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sáb', 'Dom']
    const generatedData: Array<{ day: string; hour: number; intensity: number }> = []
    
    // Patrón realista: más incidentes durante horas específicas
    days.forEach(day => {
      for (let hour = 0; hour < 24; hour++) {
        // Más incidentes durante la tarde/noche en días laborables
        let probability = 0.1 // probabilidad base
        
        // Aumentar probabilidad en horas pico
        if ((hour >= 12 && hour <= 14) || (hour >= 18 && hour <= 21)) {
          probability = 0.4
        }
        
        // Más incidentes los fines de semana por la noche
        if ((day === 'Vie' || day === 'Sáb') && hour >= 20 && hour <= 23) {
          probability = 0.6
        }
        
        // Menos incidentes en la madrugada
        if (hour >= 2 && hour <= 5) {
          probability = 0.05
        }
        
        if (Math.random() < probability) {
          const intensity = Math.floor(Math.random() * 3) + 1 // 1, 2 o 3
          generatedData.push({ day, hour, intensity })
        }
      }
    })
    
    return generatedData
  }, [data])
  
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Incidentes por hora del día</CardTitle>
        <p className="text-sm text-muted-foreground">Todas las sucursales</p>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Encabezados de horas */}
            <div className="grid grid-cols-[auto_1fr] gap-1">
              <div className="w-8"></div>
              <div className="grid grid-cols-24 gap-1">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={`header-${i}`} className="h-6 text-xs flex items-center justify-center text-muted-foreground">
                    {i < 10 ? `0${i}:00` : `${i}:00`}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Filas de días */}
            {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
              <div key={day} className="grid grid-cols-[auto_1fr] gap-1 mb-1">
                <div className="w-8 h-6 text-xs flex items-center text-muted-foreground">{day}</div>
                <div className="grid grid-cols-24 gap-1">
                  {Array.from({ length: 24 }).map((_, hour) => {
                    // Buscar si hay un incidente para este día y hora
                    const incident = heatmapData.find(d => d.day === day && d.hour === hour)
                    let bgColor = 'bg-muted/20'
                    
                    if (incident) {
                      if (incident.intensity === 1) bgColor = 'bg-emerald-500/30'
                      if (incident.intensity === 2) bgColor = 'bg-emerald-500/60'
                      if (incident.intensity === 3) bgColor = 'bg-emerald-500/90'
                    }
                    
                    return (
                      <div 
                        key={`${day}-${hour}`} 
                        className={`h-6 rounded ${bgColor}`}
                        title={incident ? `${incident.intensity} incidentes` : 'Sin incidentes'}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Definición de estilos para Tailwind
// Necesitamos definir grid-cols-24 ya que no es un valor predeterminado
export const gridColsStyles = {
  '.grid-cols-24': {
    'grid-template-columns': 'repeat(24, minmax(0, 1fr))'
  }
}