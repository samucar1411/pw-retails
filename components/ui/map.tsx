"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useTheme } from "next-themes"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getSafeImageUrl } from "@/lib/utils"

interface MapLocation {
  id: string | number
  lat: number
  lng: number
  title: string
  description: string
  address?: string
  logoUrl?: string
  officeId?: string | number
  popupContent?: string
  // Incident data
  incidentData?: {
    id: string
    date: string
    time: string
    incidentType?: string
    totalLoss?: string
    suspectCount?: number
    status?: string
    severity?: 'low' | 'medium' | 'high'
  }
}

interface MapProps {
  locations: MapLocation[]
}

export default function Map({ locations }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)


  // Function to create detailed popup content
  /* 
  const createIncidentPopupContent = async (location: MapLocation): Promise<string> => {
    let officeInfo = ''
    
    // Fetch office data if officeId is provided
    if (location.officeId) {
      try {
        const office = await getOffice(parseInt(location.officeId.toString()))
        if (office) {
          officeInfo = `
            <div class="border-t pt-3 mt-3">
              <h4 class="font-medium text-sm text-gray-700 mb-2">📍 Datos de la Sucursal</h4>
              <div class="space-y-1 text-xs">
                <p><span class="font-medium">Nombre:</span> ${office.Name}</p>
                <p><span class="font-medium">Código:</span> ${office.Code}</p>
                <p><span class="font-medium">Dirección:</span> ${office.Address}</p>
                ${office.Phone ? `<p><span class="font-medium">Teléfono:</span> ${office.Phone}</p>` : ''}
                ${office.Email ? `<p><span class="font-medium">Email:</span> ${office.Email}</p>` : ''}
                <p><span class="font-medium">Cámaras:</span> ${office.CameraCount}</p>
                <p><span class="font-medium">Puertas de acceso:</span> ${office.NumberOfAccessDoors}</p>
              </div>
            </div>
          `
        } else {
          officeInfo = `
            <div class="border-t pt-3 mt-3">
              <p class="text-xs text-gray-600">❓ Sucursal no encontrada</p>
            </div>
          `
        }
      } catch (error) {
        console.error('Error fetching office data:', error)
        officeInfo = `
          <div class="border-t pt-3 mt-3">
            <p class="text-xs text-red-600">❌ Error al cargar datos de la sucursal</p>
          </div>
        `
      }
    }

    // Build incident information
    const incidentInfo = location.incidentData ? `
      <div class="border-t pt-3 mt-3">
        <h4 class="font-medium text-sm text-gray-700 mb-2">🚨 Detalles del Incidente</h4>
        <div class="space-y-1 text-xs">
          <p><span class="font-medium">ID:</span> ${location.incidentData.id}</p>
          <p><span class="font-medium">Fecha:</span> ${format(new Date(location.incidentData.date), 'dd/MM/yyyy', { locale: es })}</p>
          <p><span class="font-medium">Hora:</span> ${location.incidentData.time}</p>
          ${location.incidentData.incidentType ? `<p><span class="font-medium">Tipo:</span> ${location.incidentData.incidentType}</p>` : ''}
          ${location.incidentData.totalLoss ? `<p><span class="font-medium">Pérdida Total:</span> Gs. ${parseFloat(location.incidentData.totalLoss).toLocaleString('es-PY')}</p>` : ''}
          ${location.incidentData.suspectCount ? `<p><span class="font-medium">Sospechosos:</span> ${location.incidentData.suspectCount}</p>` : ''}
          ${location.incidentData.status ? `<p><span class="font-medium">Estado:</span> <span class="px-2 py-1 rounded text-xs ${getSeverityClass(location.incidentData.severity)}">${location.incidentData.status}</span></p>` : ''}
        </div>
        <div class="mt-2">
          <a href="/dashboard/incidentes/${location.incidentData.id}" class="inline-block bg-primary text-primary-foreground px-3 py-1 rounded text-xs hover:opacity-80 transition-opacity">
            Ver Detalle →
          </a>
        </div>
      </div>
    ` : ''

    return `
      <div class="p-4 max-w-sm">
        <div class="flex items-center gap-2 mb-2">
          ${location.logoUrl ? `<img src="${location.logoUrl}" alt="Logo" class="w-8 h-8 rounded-full object-contain border">` : ''}
          <h3 class="font-semibold text-base">${location.title}</h3>
        </div>
        ${location.address ? `<p class="text-sm text-gray-600 mb-2">📍 ${location.address}</p>` : ''}
        <p class="text-sm text-gray-700">${location.description}</p>
        ${incidentInfo}
        ${officeInfo}
      </div>
    `
  }
  */


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

    // Agregar marcadores después de que el mapa esté listo
    const addMarkers = () => {
      if (!locations || locations.length === 0) return;
      
      locations.forEach(location => {
        if (!location || !location.lat || !location.lng) return;
        const el = document.createElement('div');
        el.className = 'custom-marker';
        
        if (location.logoUrl) {
          // Crear marcador con logo de empresa
          el.innerHTML = `
            <div style="
              width: 40px;
              height: 40px;
              background: white;
              border: 3px solid #ef4444;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 8px rgba(0,0,0,0.2);
              cursor: pointer;
              transition: all 0.2s ease;
            " class="marker-container">
              <img 
                src="${getSafeImageUrl(location.logoUrl, '')}" 
                alt="${location.title}"
                style="
                  width: 28px;
                  height: 28px;
                  border-radius: 50%;
                  object-fit: contain;
                "
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
              />
              <div style="
                width: 28px;
                height: 28px;
                background: #ef4444;
                border-radius: 50%;
                display: none;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 14px;
                font-weight: bold;
              ">
                ${location.title.charAt(0).toUpperCase()}
              </div>
            </div>
          `;
        } else {
          // Marcador por defecto (punto rojo)
          el.innerHTML = `
            <div style="
              width: 20px;
              height: 20px;
              background: #ef4444;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              cursor: pointer;
              transition: all 0.2s ease;
            "></div>
          `;
        }

        // Hover effects
        el.addEventListener('mouseenter', () => {
          const container = el.querySelector('.marker-container') as HTMLElement;
          if (container) {
            container.style.transform = 'scale(1.1)';
            container.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
          } else {
            (el.firstElementChild as HTMLElement)!.style.transform = 'scale(1.2)';
          }
        });

        el.addEventListener('mouseleave', () => {
          const container = el.querySelector('.marker-container') as HTMLElement;
          if (container) {
            container.style.transform = 'scale(1)';
            container.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          } else {
            (el.firstElementChild as HTMLElement)!.style.transform = 'scale(1)';
          }
        });

        // Crear popup
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: true,
          className: 'custom-popup'
        });

        // Click handler with single click prevention
        el.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          // Build complete content immediately (no loading state needed)
          let popupHTML = `
            <div class="bg-background text-foreground p-4 min-w-[280px] max-w-[360px]">
              <!-- Header -->
              <div class="flex items-start gap-3 mb-3">
                ${location.logoUrl ? `<img src="${getSafeImageUrl(location.logoUrl, '')}" alt="Logo" class="w-10 h-10 rounded-lg object-contain border border-border bg-background flex-shrink-0" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : `<div class="w-10 h-10 rounded-lg border border-border bg-muted flex items-center justify-center flex-shrink-0"><span class="text-lg">🏢</span></div>`}
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-base text-foreground leading-tight">${location.title}</h3>
                  ${location.address ? `<p class="text-sm text-muted-foreground mt-1">📍 ${location.address}</p>` : ''}
                </div>
              </div>`;

          // Add incident information if available
          if (location.incidentData) {
            const severityColor = 
              location.incidentData.severity === 'high' ? 'bg-red-500' :
              location.incidentData.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500';
              
            popupHTML += `
              <!-- Incident Details -->
              <div class="bg-muted/50 rounded-lg p-3 mb-3">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-lg">🚨</span>
                  <h4 class="font-medium text-sm text-foreground">Incidente</h4>
                  <div class="w-2 h-2 rounded-full ${severityColor} ml-auto"></div>
                </div>
                <div class="space-y-1 text-xs">
                  <div class="grid grid-cols-2 gap-x-3 gap-y-1">
                    <div><span class="text-muted-foreground">ID:</span> <span class="font-medium text-foreground">${location.incidentData.id}</span></div>
                    <div><span class="text-muted-foreground">Fecha:</span> <span class="font-medium text-foreground">${format(new Date(location.incidentData.date), 'dd/MM/yyyy', { locale: es })}</span></div>
                    ${location.incidentData.time ? `<div><span class="text-muted-foreground">Hora:</span> <span class="font-medium text-foreground">${location.incidentData.time}</span></div>` : ''}
                    ${location.incidentData.incidentType ? `<div><span class="text-muted-foreground">Tipo:</span> <span class="font-medium text-foreground">${location.incidentData.incidentType}</span></div>` : ''}
                  </div>
                  ${location.incidentData.totalLoss ? `<div class="mt-2 pt-2 border-t border-border"><span class="text-muted-foreground">Pérdida:</span> <span class="font-semibold text-red-600">Gs. ${parseFloat(location.incidentData.totalLoss).toLocaleString('es-PY')}</span></div>` : ''}
                  ${location.incidentData.suspectCount ? `<div><span class="text-muted-foreground">Sospechosos:</span> <span class="font-medium text-foreground">${location.incidentData.suspectCount}</span></div>` : ''}
                </div>
                <div class="mt-3">
                  <a href="/dashboard/incidentes/${location.incidentData.id}" class="inline-flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-medium hover:bg-primary/90 transition-colors">
                    Ver Detalle 
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </a>
                </div>
              </div>`;
          }

          // Add office information (static data - no async loading needed)
          if (location.officeId) {
            popupHTML += `
              <!-- Office Info -->
              <div class="bg-muted/30 rounded-lg p-3">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-lg">🏢</span>
                  <h4 class="font-medium text-sm text-foreground">Sucursal</h4>
                </div>
                <div class="text-xs text-muted-foreground">
                  <p>Información detallada disponible en el detalle del incidente</p>
                </div>
              </div>`;
          }

          // Close the main div
          popupHTML += `</div>`;
          
          // Close any existing popup first
          const existingPopups = document.querySelectorAll('.mapboxgl-popup');
          existingPopups.forEach(popup => popup.remove());
          
          // Show popup immediately
          popup
            .setLngLat([location.lng, location.lat])
            .setHTML(popupHTML)
            .addTo(map);
        }, { once: false });

        // Agregar marcador al mapa
        try {
          new mapboxgl.Marker(el)
            .setLngLat([location.lng, location.lat])
            .addTo(map);
        } catch (error) {
          console.error('Error adding marker:', error, location);
        }
      });
    };

    // Esperar a que el mapa cargue y luego agregar los marcadores
    map.on('load', () => {
      // Pequeño delay para asegurar que todo esté listo
      setTimeout(() => {
        addMarkers();
        
        // Fit map to show all markers if there are multiple locations
        if (locations && locations.length > 1) {
          const bounds = new mapboxgl.LngLatBounds();
          const validLocations = locations.filter(location => 
            location && location.lat && location.lng
          );
          
          if (validLocations.length > 1) {
            validLocations.forEach(location => {
              bounds.extend([location.lng, location.lat]);
            });
            map.fitBounds(bounds, { padding: 50 });
          }
        }
      }, 100);
    });

    return () => map.remove()
  }, [locations, mounted, currentTheme])

  return (
    <>
      <style jsx global>{`
        .custom-popup .mapboxgl-popup-content {
          padding: 0;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          border: 1px solid hsl(var(--border));
          max-width: 380px;
          background: hsl(var(--background));
          color: hsl(var(--foreground));
        }
        
        .custom-popup .mapboxgl-popup-tip {
          border-top-color: hsl(var(--background));
        }
        
        .custom-popup h3, .custom-popup h4 {
          margin: 0;
          color: hsl(var(--foreground));
        }
        
        .custom-popup p, .custom-popup span, .custom-popup div {
          color: inherit;
        }
        
        .custom-popup .text-muted-foreground {
          color: hsl(var(--muted-foreground));
        }
        
        .custom-popup .text-foreground {
          color: hsl(var(--foreground));
        }
        
        .custom-popup .bg-background {
          background-color: hsl(var(--background));
        }
        
        .custom-popup .bg-muted {
          background-color: hsl(var(--muted));
        }
        
        .custom-popup .bg-muted\\/50 {
          background-color: hsl(var(--muted) / 0.5);
        }
        
        .custom-popup .bg-muted\\/30 {
          background-color: hsl(var(--muted) / 0.3);
        }
        
        .custom-popup .border-border {
          border-color: hsl(var(--border));
        }
        
        .custom-popup .bg-primary {
          background-color: hsl(var(--primary));
        }
        
        .custom-popup .text-primary-foreground {
          color: hsl(var(--primary-foreground));
        }
        
        .custom-popup a {
          text-decoration: none;
          transition: all 0.2s ease;
        }
        
        .custom-popup a:hover {
          filter: brightness(0.9);
        }

        .custom-marker {
          cursor: pointer;
          z-index: 1;
        }
        
        .marker-container {
          transition: all 0.2s ease;
        }
        
        .marker-container:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 12px rgba(0,0,0,0.3);
        }
        
        /* Dark mode specific adjustments */
        @media (prefers-color-scheme: dark) {
          .custom-popup .mapboxgl-popup-content {
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          }
        }
      `}</style>
      <div ref={mapRef} className="h-full w-full min-h-[400px] rounded-md" />
    </>
  )
} 