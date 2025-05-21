// components/IncidentsTable.tsx
"use client";

import {
  Pagination, PaginationContent, PaginationItem,
  PaginationPrevious, PaginationLink, PaginationNext
} from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIncidents } from "@/hooks/use-incident";
import { Incident, IncidentType } from "@/types/incident";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, BuildingIcon, DollarSignIcon, UserIcon } from "lucide-react";
import { getSuspectById } from "@/services/suspect-service";
import { getIncidentTypeWithCache } from "@/services/incident-type-service";
import React, { useState, useEffect } from "react";

// Helper function to format date in a more readable way
const formatDate = (dateStr: string | undefined, timeStr: string | undefined) => {
  if (!dateStr || !timeStr) return 'Fecha no disponible';
  
  try {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    // Format time to be more readable (remove seconds)
    const formattedTime = timeStr.substring(0, 5); // HH:MM format
    
    return {
      date: date.toLocaleDateString('es-PY', options),
      time: formattedTime,
      fullDate: `${date.toLocaleDateString('es-PY', options)}, ${formattedTime}hs`
    };
  } catch {
    // Fallback if date parsing fails
    return {
      date: dateStr,
      time: timeStr,
      fullDate: `${dateStr}, ${timeStr}`
    };
  }
};

// Helper to parse numeric string values
const parseNumeric = (value: string | number | undefined): number => {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return value;
  return parseFloat(value) || 0;
};

// Format currency with proper symbol and thousands separators
const formatCurrency = (value: number): string => {
  return value.toLocaleString("es-PY", {
    style: "currency",
    currency: "PYG",
    maximumFractionDigits: 0,
  });
};

// Component to display suspect information
const SuspectInfo = ({ suspectId }: { suspectId: string }) => {
  const [suspect, setSuspect] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSuspect = async () => {
      try {
        const data = await getSuspectById(suspectId);
        setSuspect(data);
      } catch (error) {
        console.error("Error fetching suspect:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSuspect();
  }, [suspectId]);
  
  if (loading) return <Skeleton className="h-4 w-24" />;
  
  return (
    <div className="flex items-center gap-1">
      <UserIcon className="h-3 w-3 text-muted-foreground" />
      <span className="text-xs">
        {suspect?.Name || suspect?.Alias || "Sospechoso desconocido"}
      </span>
    </div>
  );
};

// Component to display incident type information
const IncidentTypeInfo = ({ typeId }: { typeId: number }) => {
  const [incidentType, setIncidentType] = useState<IncidentType | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchIncidentType = async () => {
      try {
        const data = await getIncidentTypeWithCache(typeId);
        setIncidentType(data);
      } catch (error) {
        console.error("Error fetching incident type:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchIncidentType();
  }, [typeId]);
  
  if (loading) return <Skeleton className="h-4 w-20" />;
  
  return (
    <Badge variant="outline" className="text-xs font-medium">
      {incidentType?.name || `Tipo ${typeId}`}
    </Badge>
  );
};

// Component to display financial losses in a more readable format
const LossesInfo = ({ incident }: { incident: Incident }) => {
  const cashLoss = parseNumeric(incident.CashLoss || incident.cashLoss);
  const merchandiseLoss = parseNumeric(incident.MerchandiseLoss || incident.merchandiseLoss);
  const otherLosses = parseNumeric(incident.OtherLosses || incident.otherLosses);
  const totalLoss = parseNumeric(incident.TotalLoss || incident.totalLoss);
  
  // Calculate percentage of each loss type
  const calculatePercentage = (value: number) => {
    if (totalLoss === 0) return 0;
    return Math.round((value / totalLoss) * 100);
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{formatCurrency(totalLoss)}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="w-60">
          <div className="space-y-2 p-1">
            <h4 className="text-sm font-semibold">Desglose de pérdidas</h4>
            {cashLoss > 0 && (
              <div className="flex justify-between text-xs">
                <span>Efectivo:</span>
                <span className="font-medium">
                  {formatCurrency(cashLoss)} ({calculatePercentage(cashLoss)}%)
                </span>
              </div>
            )}
            {merchandiseLoss > 0 && (
              <div className="flex justify-between text-xs">
                <span>Mercadería:</span>
                <span className="font-medium">
                  {formatCurrency(merchandiseLoss)} ({calculatePercentage(merchandiseLoss)}%)
                </span>
              </div>
            )}
            {otherLosses > 0 && (
              <div className="flex justify-between text-xs">
                <span>Otros:</span>
                <span className="font-medium">
                  {formatCurrency(otherLosses)} ({calculatePercentage(otherLosses)}%)
                </span>
              </div>
            )}
            <div className="flex justify-between text-xs font-semibold pt-1 border-t">
              <span>Total:</span>
              <span>{formatCurrency(totalLoss)}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export function IncidentsTable() {
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const { data, isLoading, isError, isFetching } = useIncidents(page, pageSize);

  if (isLoading) return <p>Cargando…</p>;
  if (isError)   return <p>Error al cargar datos</p>;

  // Calculate total pages based on data count
  const totalPages = Math.ceil(data!.count / pageSize);

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Fecha y Hora</TableHead>
            <TableHead className="w-[120px]">Tipo</TableHead>
            <TableHead className="w-[120px]">Sucursal</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="w-[150px]">Pérdida Total</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data?.results.map((inc: Incident) => {
            const formattedDate = formatDate(inc.Date || inc.date, inc.Time || inc.time);
            return (
              <TableRow key={inc.id} className="group hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formattedDate.date}</span>
                    </div>
                    <span className="text-xs text-muted-foreground pl-6">{formattedDate.time}hs</span>
                  </div>
                </TableCell>
                <TableCell>
                  <IncidentTypeInfo typeId={inc.IncidentType || Number(inc.incidentTypeId) || 0} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <BuildingIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Sucursal {inc.Office || inc.officeId}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{inc.Description || inc.description || "Sin descripción"}</div>
                    {inc.Suspects && inc.Suspects.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {inc.Suspects.map((suspectId) => (
                          <SuspectInfo key={suspectId} suspectId={suspectId} />
                        ))}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <LossesInfo incident={inc} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Paginations */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              aria-disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            />
          </PaginationItem>

          {Array.from({ length: totalPages }, (_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                isActive={page === i + 1}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              aria-disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {/* Loader pequeño mientras cambia la página */}
      {isFetching && <p className="text-sm text-muted-foreground">Actualizando…</p>}
    </div>
  );
}