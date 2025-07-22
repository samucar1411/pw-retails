"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Incident } from "@/types/incident";
import { Clock } from "lucide-react";

interface HeatmapCell {
  day: string;
  hour: number;
  count: number;
}

interface HourlyIncidentsChartProps {
  data: Incident[];
}

const daysOfWeek = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sáb", "Dom"];
const hoursOfDay = Array.from({ length: 12 }, (_, i) => (i * 2).toString().padStart(2, "0") + ":00");

// Define background color and intensity levels for Tailwind
const getColorClass = (value: number): string => {
    if (value === 0) return "bg-muted/30";
    if (value === 1) return "bg-green-800";
    if (value === 2) return "bg-green-700";
    if (value === 3) return "bg-green-600";
    return "bg-green-500";
};

export function HourlyIncidentsChart({ data }: HourlyIncidentsChartProps) {
  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const heatmapData = React.useMemo(() => {
    const cells: HeatmapCell[] = [];
    
    // Initialize all cells with count 0
    days.forEach(day => {
      hours.forEach(hour => {
        cells.push({ day, hour, count: 0 });
      });
    });

    // Count incidents for each cell
    data.forEach(incident => {
      const date = new Date(`${incident.Date}T${incident.Time || '00:00'}`);
      const day = days[date.getDay()];
      const hour = date.getHours();
      
      const cell = cells.find(c => c.day === day && c.hour === hour);
      if (cell) {
        cell.count++;
      }
    });

    return cells;
  }, [data]);

  const isEmpty = data.length === 0;

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Incidentes por hora del día</CardTitle>
        <CardDescription>Todas las sucursales</CardDescription>
      </CardHeader>
      <CardContent className="pl-4 pr-4 pb-4">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <Clock className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm font-medium">No hay datos disponibles</p>
            <p className="text-xs">No se han registrado incidentes aún</p>
          </div>
        ) : (
          <TooltipProvider delayDuration={100}>
            <div className="flex gap-2">
              {/* Day Labels */}
              <div className="flex flex-col justify-between text-xs text-muted-foreground pt-5 pb-9" style={{height: '160px'}}>
                {daysOfWeek.map((day) => (
                  <div key={day} className="h-4 flex items-center">{day}</div>
                ))}
              </div>

              {/* Heatmap Grid */}
              <div className="flex-1">
                <div className="grid grid-rows-7 grid-flow-col gap-1" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))', height: '160px' }}>
                  {heatmapData.map((cell, index) => {
                    const tooltipContent = cell.count > 0
                      ? `${cell.day}, ${cell.hour.toString().padStart(2, '0')}:00 - ${(cell.hour + 1).toString().padStart(2, '0')}:00: ${cell.count} incidente(s)`
                      : null;

                    return (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "w-full h-4 rounded-[2px]",
                              getColorClass(cell.count)
                            )}
                          />
                        </TooltipTrigger>
                        {tooltipContent && (
                          <TooltipContent>
                            <p>{tooltipContent}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    );
                  })}
                </div>

                {/* Hour Labels */}
                <div className="flex justify-between text-xs text-muted-foreground mt-1 px-[calc(100%/48)]">
                  {hoursOfDay.map((hour) => (
                    <div key={hour}>{hour}</div>
                  ))}
                  <div className="w-0"></div>
                </div>
              </div>
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
} 