"use client";

import * as React from "react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "visor-ui";
import { Calendar, MapPin, AlertTriangle, Eye, Clock } from "lucide-react";

// Datos de ejemplo para el dashboard
const incidentesData = {
  total: 303,
  sospechososIdentificados: 37,
  sospechososNoIdentificados: 187,
  sucursalesAfectadas: 102,
};

// Datos de ejemplo para la tabla de incidentes recientes
const incidentesRecientes = [
  {
    id: "02/04/25-14:32",
    fecha: "02/04/25-14:32",
    sucursal: "PUNTO 560",
    delito: "Hurto",
    estado: "Alerta",
  },
  {
    id: "01/04/25-10:15",
    fecha: "01/04/25-10:15",
    sucursal: "PUNTO 230",
    delito: "Hurto",
    estado: "Resuelto",
  },
  {
    id: "31/03/25-16:45",
    fecha: "31/03/25-16:45",
    sucursal: "PUNTO 120",
    delito: "Vandalismo",
    estado: "En proceso",
  },
  {
    id: "30/03/25-09:22",
    fecha: "30/03/25-09:22",
    sucursal: "PUNTO 340",
    delito: "Hurto",
    estado: "Alerta",
  },
  {
    id: "29/03/25-18:05",
    fecha: "29/03/25-18:05",
    sucursal: "PUNTO 450",
    delito: "Vandalismo",
    estado: "Resuelto",
  },
];

// Datos de ejemplo para el gráfico de calor de incidentes por hora
const horasDelDia = [
  "00:00",
  "02:00",
  "04:00",
  "06:00",
  "08:00",
  "10:00",
  "12:00",
  "14:00",
  "16:00",
  "18:00",
  "20:00",
  "22:00",
];
const diasDeLaSemana = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom", "Lun"];

// Componente para mostrar las estadísticas
const StatsCard = ({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: number;
  subtitle: string;
  color?: string;
}) => {
  return (
    <Card className="flex-1">
      <CardContent className="p-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <h2 className="text-3xl font-bold">{value}</h2>
          <p className="text-xs text-muted-foreground">
            <span className={`text-${color || "green-500"}`}>{subtitle}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para el gráfico de calor
const HeatmapChart = () => {
  // Simulamos datos de incidentes por hora y día
  const getRandomIntensity = () => {
    const random = Math.random();
    if (random > 0.8) return "bg-green-500";
    if (random > 0.6) return "bg-green-400";
    if (random > 0.4) return "bg-green-300";
    return "";
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="flex flex-col">
          <div className="grid grid-cols-[80px_repeat(12,1fr)] gap-1">
            <div></div>
            {horasDelDia.map((hora, i) => (
              <div
                key={i}
                className="text-xs text-center text-muted-foreground"
              >
                {hora}
              </div>
            ))}
          </div>

          {diasDeLaSemana.map((dia, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-[80px_repeat(12,1fr)] gap-1 mt-1"
            >
              <div className="text-xs flex items-center">{dia}</div>
              {Array.from({ length: 12 }).map((_, colIndex) => {
                // Generamos celdas con diferentes intensidades
                const cellClass = getRandomIntensity();
                return (
                  <div
                    key={colIndex}
                    className={`w-full aspect-square rounded ${cellClass}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente para la tabla de incidentes recientes
const IncidentesRecientesTable = ({ incidentes }: { incidentes: any[] }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-3 text-sm font-medium">ID</th>
            <th className="text-left p-3 text-sm font-medium">Fecha</th>
            <th className="text-left p-3 text-sm font-medium">Sucursal</th>
            <th className="text-left p-3 text-sm font-medium">Delito</th>
            <th className="text-left p-3 text-sm font-medium">Estado</th>
            <th className="text-left p-3 text-sm font-medium">Acción</th>
          </tr>
        </thead>
        <tbody>
          {incidentes.map((incidente) => (
            <tr
              key={incidente.id}
              className="border-b border-border hover:bg-muted/50"
            >
              <td className="p-3 text-sm">{incidente.id}</td>
              <td className="p-3 text-sm">{incidente.fecha}</td>
              <td className="p-3 text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {incidente.sucursal}
              </td>
              <td className="p-3 text-sm">
                <Badge
                  variant={
                    incidente.delito === "Hurto" ? "destructive" : "outline"
                  }
                >
                  {incidente.delito}
                </Badge>
              </td>
              <td className="p-3 text-sm">
                <Badge
                  variant={
                    incidente.estado === "Alerta"
                      ? "destructive"
                      : incidente.estado === "En proceso"
                      ? "warning"
                      : "success"
                  }
                >
                  {incidente.estado}
                </Badge>
              </td>
              <td className="p-3 text-sm">
                <Button variant="ghost" size="sm">
                  Ver detalles
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function MonitoreoPage() {
  const [periodoSeleccionado, setPeriodoSeleccionado] =
    useState("Enero - Abril 2025");
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(
    "Todas las sucursales"
  );

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Visión General</h1>
        <p className="text-muted-foreground">Monitorear actividad principal</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative">
          <Button
            variant="outline"
            className="w-full sm:w-auto justify-between gap-2"
          >
            {sucursalSeleccionada}
            <span className="opacity-50">▼</span>
          </Button>
        </div>
        <div className="relative">
          <Button
            variant="outline"
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            {periodoSeleccionado}
          </Button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total de incidentes"
          value={incidentesData.total}
          subtitle="Ver incidentes"
        />
        <StatsCard
          title="Sospechosos identificados"
          value={incidentesData.sospechososIdentificados}
          subtitle="Ver sospechosos"
          color="blue-500"
        />
        <StatsCard
          title="Sospechosos no identificados"
          value={incidentesData.sospechososNoIdentificados}
          subtitle="Ver sospechosos"
          color="yellow-500"
        />
        <StatsCard
          title="Sucursales afectadas"
          value={incidentesData.sucursalesAfectadas}
          subtitle="Ver sucursales afectadas"
          color="red-500"
        />
      </div>

      {/* Gráfico de calor de incidentes por hora */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1">
            <CardTitle>Incidentes por hora del día</CardTitle>
            <p className="text-sm text-muted-foreground">
              Todas las sucursales
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <HeatmapChart />
        </CardContent>
      </Card>

      {/* Tabla de incidentes recientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>Incidentes recientes</CardTitle>
            <p className="text-sm text-muted-foreground">Enero - Abril 2025</p>
          </div>
          <Button variant="outline" size="sm">
            Ver todos
          </Button>
        </CardHeader>
        <CardContent>
          <IncidentesRecientesTable incidentes={incidentesRecientes} />
        </CardContent>
      </Card>

      {/* Sección de mapa y distribución */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-1">
              <CardTitle>Mapa de incidentes</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enero - Abril 2025
              </p>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/20">
            <p className="text-muted-foreground">
              Mapa interactivo de incidentes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-1">
              <CardTitle>Distribución de incidentes</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enero - Abril 2025
              </p>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/20">
            <p className="text-muted-foreground">
              Gráfico de distribución de incidentes
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
