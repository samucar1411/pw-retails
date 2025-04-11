"use client";

import React, { useEffect, useState } from "react";
import { 
  Card, CardContent, CardHeader, CardTitle,
  Button, 
  Avatar, AvatarImage
} from "visor-ui";
import { Calendar, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Definir interfaces para nuestros tipos de datos
interface StatCard {
  title: string;
  value: string;
  linkText: string;
  color: string;
}

interface Incident {
  id: string;
  fecha: string;
  sucursal: string;
  delito: string;
  estado: string;
}

interface HeatmapDay {
  day: string;
  hours: number[];
}

// Datos estáticos de estadísticas
const statCards: StatCard[] = [
  {
    title: "Total de incidentes",
    value: "303",
    linkText: "Ver incidentes",
    color: "green",
  },
  {
    title: "Sospechosos identificados",
    value: "37",
    linkText: "Ver sospechosos",
    color: "green",
  },
  {
    title: "Sospechosos no identificados",
    value: "187",
    linkText: "Ver sospechosos",
    color: "green",
  },
  {
    title: "Sucursales afectadas",
    value: "102",
    linkText: "Ver sucursales afectadas",
    color: "green",
  },
];

// Datos estáticos para la tabla de incidentes
const recentIncidents: Incident[] = [
  {
    id: "02/04/25 - 14:32",
    fecha: "02/04/25 - 14:32",
    sucursal: "PUNTO 560",
    delito: "Hurto",
    estado: "Abierto",
  },
  {
    id: "02/04/25 - 12:15",
    fecha: "02/04/25 - 12:15",
    sucursal: "PUNTO 321",
    delito: "Vandalismo",
    estado: "Cerrado",
  },
  {
    id: "01/04/25 - 18:45",
    fecha: "01/04/25 - 18:45",
    sucursal: "PUNTO 118",
    delito: "Hurto",
    estado: "Abierto",
  },
];

// Nombres de los días para el mapa de calor
const weekdays: string[] = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom", "Lun"];

export default function Dashboard() {
  const [currentPeriod, setCurrentPeriod] = useState("Enero - Abril 2025");
  const [selectedSucursal, setSelectedSucursal] = useState("Todas las sucursales");
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Generar datos de mapa de calor una vez en el cliente
  useEffect(() => {
    // Crear un patrón predeterminado como en la imagen
    const predefinedPattern = [
      { day: "Lun", hours: Array(24).fill(0) },
      { day: "Mar", hours: [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0] },
      { day: "Mié", hours: [0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,0,0,0,0,0,0,0] },
      { day: "Jue", hours: [0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1,0,0,0,0,0,0] },
      { day: "Vie", hours: [0,0,0,0,0,0,0,0,0,0,1,0,0,1,1,1,0,0,0,0,0,0,0,0] },
      { day: "Sáb", hours: [0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0] },
      { day: "Dom", hours: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
      { day: "Lun", hours: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
    ];
    
    setHeatmapData(predefinedPattern);
    setIsClient(true);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
        <div className="p-4 flex items-center space-x-2 border-b border-gray-800">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <Image src="/icon.png" alt="Logo" width={20} height={20} className="text-white" />
          </div>
          <div className="flex flex-col">
            <div className="font-medium">PUNTO 560</div>
            <div className="text-xs text-gray-400">Gral. Máximo Santos...</div>
          </div>
          <button className="ml-auto text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
        
        <div className="py-2 px-4 text-xs text-gray-500 font-medium">ADMINISTRACIÓN</div>
        
        <nav className="flex-1">
          <ul className="space-y-1 px-2">
            <li>
              <Link href="/dashboard" className="flex items-center space-x-2 px-3 py-2 rounded bg-gray-800 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span>Tablero</span>
              </Link>
            </li>
            <li>
              <Link href="/incidente" className="flex items-center space-x-2 px-3 py-2 rounded text-gray-400 hover:bg-gray-800 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <span>Registrar incidente</span>
              </Link>
            </li>
            <li>
              <Link href="/alertas" className="flex items-center space-x-2 px-3 py-2 rounded text-gray-400 hover:bg-gray-800 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span>Alertas</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="mt-auto p-4 border-t border-gray-800 flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
            <Image src="/avatars/user.png" alt="User" width={32} height={32} className="rounded-full" />
          </div>
          <div className="ml-2">
            <div className="text-sm font-medium">Christian Courget</div>
            <div className="text-xs text-gray-400 truncate">c.courget@powervisi...</div>
          </div>
          <button className="ml-auto text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top navigation */}
        <header className="h-14 border-b border-gray-800 flex items-center justify-between px-6">
          <div className="relative w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input 
              type="text" 
              placeholder="Buscador general..." 
              className="w-full h-9 pl-9 pr-3 text-sm bg-gray-800 rounded-md border border-gray-700 focus:outline-none focus:border-blue-500 text-white"
            />
          </div>
          
          <div className="flex items-center">
            <button className="p-2 text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>
            <button className="p-2 ml-2 text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            </button>
            <button className="p-2 ml-2 text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
          </div>
        </header>
        
        {/* Main dashboard content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Visión General</h1>
                <p className="text-gray-400">Monitorear actividad principal</p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700 text-white rounded-md">
                <span className="mr-2">+</span> Registrar incidente
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="outline" className="border-gray-700 px-4 py-2 flex items-center bg-gray-800 text-white">
                  {selectedSucursal}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" className="border-gray-700 px-4 py-2 flex items-center bg-gray-800 text-white">
                  <Calendar className="mr-2 h-4 w-4" />
                  {currentPeriod}
                </Button>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700 rounded-md overflow-hidden">
                  <CardHeader className="pb-2 px-4 pt-4">
                    <CardTitle className="text-md text-gray-200">{stat.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                    <div className="mt-2">
                      <Link 
                        href="#" 
                        className="text-sm text-green-500 hover:underline"
                      >
                        {stat.linkText}
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Heat map */}
            <Card className="bg-gray-800 border-gray-700 rounded-md overflow-hidden">
              <CardHeader className="pb-2 px-4 pt-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-md text-gray-200">Incidentes por hora del día</CardTitle>
                  <span className="text-sm text-gray-400">{selectedSucursal}</span>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {!isClient ? (
                  <div className="h-[280px] w-full flex items-center justify-center">
                    <div className="text-gray-400 text-sm">Cargando datos...</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-[auto_1fr] gap-4">
                    <div className="flex flex-col justify-between">
                      {heatmapData.map((day, i) => (
                        <div key={i} className="text-sm py-1 text-gray-300">{day.day}</div>
                      ))}
                    </div>
                    <div>
                      <div className="grid grid-rows-8 grid-cols-24 gap-1 h-[240px]">
                        {heatmapData.length > 0 ? heatmapData.flatMap((day, dayIndex) => 
                          day.hours.map((value, hourIndex) => (
                            <div 
                              key={`${dayIndex}-${hourIndex}`} 
                              className={`rounded-sm ${value > 0 ? 'bg-green-500' : 'bg-gray-700'}`}
                              style={{ opacity: value > 0 ? 0.8 : 0.15 }}
                            />
                          ))
                        ) : (
                          Array(192).fill(0).map((_, i) => (
                            <div key={i} className="rounded-sm bg-gray-700" style={{ opacity: 0.15 }} />
                          ))
                        )}
                      </div>
                      <div className="grid grid-cols-24 gap-1 text-xs text-gray-400 mt-2">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div key={i} className={`col-span-2 text-center ${i % 2 === 0 ? '' : 'invisible'}`}>
                            {i * 2}:00
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Incidentes recientes */}
            <Card className="bg-gray-800 border-gray-700 rounded-md overflow-hidden">
              <CardHeader className="pb-2 px-4 pt-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-md text-gray-200">Incidentes recientes</CardTitle>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-400 mr-4">{currentPeriod}</span>
                    <Button variant="outline" size="sm" className="text-green-500 bg-transparent border-gray-700">
                      Ver todos
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Fecha</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Sucursal</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Delito</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Estado</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentIncidents.map((incident) => (
                        <tr key={incident.id} className="border-b border-gray-700">
                          <td className="py-3 px-4 text-gray-300">{incident.id}</td>
                          <td className="py-3 px-4 text-gray-300">{incident.fecha}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="text-gray-300">{incident.sucursal}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center rounded-full bg-red-900 px-2 py-1 text-xs font-medium text-red-300">
                              {incident.delito}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span 
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                incident.estado === "Abierto" 
                                  ? "bg-green-900 text-green-300" 
                                  : "bg-gray-700 text-gray-300"
                              }`}
                            >
                              {incident.estado}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm" className="text-green-500 hover:text-green-400 hover:bg-gray-700">
                              Ver detalle
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Mapa y distribución */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-gray-800 border-gray-700 rounded-md overflow-hidden">
                <CardHeader className="pb-2 px-4 pt-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-md text-gray-200">Mapa de incidentes</CardTitle>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-400 mr-4">{currentPeriod}</span>
                      <Button variant="outline" size="sm" className="text-green-500 bg-transparent border-gray-700">
                        Ver todos
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="h-[200px] flex items-center justify-center bg-gray-700 rounded-md">
                    <div className="text-gray-400 text-sm">Mapa no disponible en esta vista</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700 rounded-md overflow-hidden">
                <CardHeader className="pb-2 px-4 pt-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-md text-gray-200">Distribución de incidentes</CardTitle>
                    <span className="text-sm text-gray-400">{currentPeriod}</span>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="h-[200px] flex items-center justify-center bg-gray-700 rounded-md">
                    <div className="text-gray-400 text-sm">Gráfica no disponible en esta vista</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}