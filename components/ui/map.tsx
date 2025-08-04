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
  description: string
  address?: string
  logoUrl?: string
  officeId?: string | number
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

    // Esperar a que el mapa cargue para agregar los marcadores
    map.on('load', () => {
      // Agregar marcadores personalizados
      locations.forEach(location => {
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
                src="${location.logoUrl}" 
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
            el.firstElementChild!.style.transform = 'scale(1.2)';
          }
        });

        el.addEventListener('mouseleave', () => {
          const container = el.querySelector('.marker-container') as HTMLElement;
          if (container) {
            container.style.transform = 'scale(1)';
            container.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          } else {
            el.firstElementChild!.style.transform = 'scale(1)';
          }
        });

        // Crear popup
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: true,
          className: 'custom-popup'
        });

        // Click handler
        el.addEventListener('click', () => {
          const popupHTML = location.popupContent || `
            <div class="p-3">
              <h3 class="font-semibold text-lg mb-2">${location.title}</h3>
              ${location.address ? `<p class="text-sm text-gray-600 mb-2">${location.address}</p>` : ''}
              <p class="text-sm">${location.description}</p>
            </div>
          `;
          
          popup
            .setLngLat([location.lng, location.lat])
            .setHTML(popupHTML)
            .addTo(map);
        });

        // Agregar marcador al mapa
        new mapboxgl.Marker(el)
          .setLngLat([location.lng, location.lat])
          .addTo(map);
      });
    });

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