import * as React from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Shield, AlertTriangle, Flame, Crosshair, UserX, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from 'next/image'

interface AlertModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "shoplifting" | "weapon" | "fire" | "criminal"
  location: string
  timestamp: string
  description: string
  imageUrl?: string
}

const alertConfig = {
  shoplifting: {
    icon: UserX,
    title: "Alerta de Hurto",
    subtitle: "Actividad Sospechosa Detectada",
    color: "bg-yellow-500",
    textColor: "text-yellow-500",
    borderColor: "border-yellow-500/20",
    bgColor: "bg-yellow-500/10",
    sound: "/sounds/emergency.mp3"
  },
  weapon: {
    icon: Crosshair,
    title: "Alerta de Arma",
    subtitle: "Amenaza Potencial Identificada",
    color: "bg-red-500",
    textColor: "text-red-500",
    borderColor: "border-red-500/20",
    bgColor: "bg-red-500/10",
    sound: "/sounds/emergency.mp3"
  },
  fire: {
    icon: Flame,
    title: "Alerta de Fuego",
    subtitle: "Emergencia de Incendio",
    color: "bg-orange-500",
    textColor: "text-orange-500",
    borderColor: "border-orange-500/20",
    bgColor: "bg-orange-500/10",
    sound: "/sounds/emergency.mp3"
  },
  criminal: {
    icon: AlertTriangle,
    title: "Persona Sospechosa",
    subtitle: "Individuo de Alto Riesgo",
    color: "bg-red-600",
    textColor: "text-red-600",
    borderColor: "border-red-600/20",
    bgColor: "bg-red-600/10",
    sound: "/sounds/emergency.mp3"
  }
}

export function AlertModal({
  open,
  onOpenChange,
  type,
  location,
  timestamp,
  description,
  imageUrl
}: AlertModalProps) {
  const config = alertConfig[type]
  const Icon = config.icon

  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  React.useEffect(() => {
    if (open) {
      audioRef.current = new Audio(config.sound)
      audioRef.current.play()
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current = null
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [open, config.sound])

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl bg-white dark:bg-gray-900 p-0 overflow-hidden">
        <div className={cn("w-full h-1.5", config.color)} />
        
        <div className="p-6">
          <AlertDialogHeader>
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-3 rounded-lg",
                config.bgColor,
                config.borderColor,
                "border-2"
              )}>
                <Icon className={cn("h-6 w-6", config.textColor)} />
              </div>
              <div className="space-y-2">
                <div>
                  <AlertDialogTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    {config.title}
                  </AlertDialogTitle>
                  <p className={cn(
                    "text-sm font-medium mt-1",
                    config.textColor
                  )}>
                    {config.subtitle}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {location}
                    </p>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-300" />
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "font-medium",
                      config.textColor,
                      config.borderColor
                    )}
                  >
                    {new Date(timestamp).toLocaleString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit"
                    })}
                  </Badge>
                </div>
              </div>
            </div>
          </AlertDialogHeader>

          <AlertDialogDescription className="mt-6">
            <div className="space-y-4">
              {imageUrl && (
                <div className="relative h-48 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                  <Image 
                    src={imageUrl} 
                    alt="Evidencia" 
                    width={100} 
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className={cn(
                "p-4 rounded-xl",
                config.bgColor,
                config.borderColor,
                "border"
              )}>
                <h4 className={cn(
                  "text-sm font-semibold mb-2",
                  config.textColor
                )}>
                  Descripción del Incidente
                </h4>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {description}
                </p>
              </div>
            </div>
          </AlertDialogDescription>

          <AlertDialogFooter className="mt-6 flex gap-3">
            <AlertDialogAction 
              className={cn(
                "flex-1 gap-2",
                config.color,
                "text-white font-semibold hover:opacity-90 transition-opacity"
              )}
            >
              <Shield className="h-4 w-4" />
              Iniciar Protocolo de Emergencia
            </AlertDialogAction>
            <AlertDialogCancel className="flex-1 font-medium">
              Descartar Alerta
            </AlertDialogCancel>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
} 