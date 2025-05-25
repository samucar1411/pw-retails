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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Hash, Loader2, Search, UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getSuspectById } from "@/services/suspect-service";
import { getIncidentTypeById } from "@/services/incident-type-service";
import { getOffice } from "@/services/office-service";
import React, { useState, useEffect, useMemo } from "react";
import { Suspect } from "@/types/suspect";
import { Office } from "@/types/office";

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
const SuspectInfo = React.memo(function SuspectInfo({ suspectId }: { suspectId: string }) {
  const [suspect, setSuspect] = useState<Suspect | null>(null);
  
  useEffect(() => {
    const fetchSuspect = async () => {
      try {
        const data = await getSuspectById(suspectId);
        setSuspect(data);
      } catch (error) {
        console.error("Error fetching suspect:", error);
      }
    };
    
    fetchSuspect();
  }, [suspectId]);
  
  if (!suspect) return <Skeleton className="h-4 w-24" />;
  
  return (
    <div className="flex items-center gap-1.5 group">
      <UserIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-xs font-medium text-foreground/90 hover:underline cursor-help truncate max-w-[120px]">
            {suspect.Alias || 'Sospechoso'}
          </span>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[300px] text-sm">
          <div className="space-y-1">
            <p className="font-semibold">{suspect.Alias || 'Sospechoso'}</p>
            {suspect.PhysicalDescription && (
              <p className="text-muted-foreground">{suspect.PhysicalDescription}</p>
            )}
            {suspect.StatusDetails && (
              <div className="mt-1">
                <Badge variant={suspect.Status === 1 ? 'destructive' : 'outline'} className="text-xs">
                  {suspect.StatusDetails.Name}
                </Badge>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
});

// Component to display incident type information with caching
const IncidentTypeInfo = React.memo(function IncidentTypeInfo({ typeId }: { typeId: number }) {
  const [incidentType, setIncidentType] = useState<IncidentType | null>(null);
  
  useEffect(() => {
    const fetchIncidentType = async () => {
      try {
        const data = await getIncidentTypeById(typeId);
        setIncidentType(data);
      } catch (error) {
        console.error("Error fetching incident type:", error);
      }
    };
    
    fetchIncidentType();
  }, [typeId]);
  
  if (!incidentType) return <Skeleton className="h-4 w-20" />;
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className="text-xs font-medium">
          {incidentType.name}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm">{incidentType.name || 'Sin descripción'}</p>
      </TooltipContent>
    </Tooltip>
  );
});

// Component to display office information with caching
const OfficeInfo = React.memo(function OfficeInfo({ officeId }: { officeId: number }) {
  const [office, setOffice] = useState<Office | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchOffice = async () => {
      try {
        const data = await getOffice(officeId);
        setOffice(data);
      } catch (error) {
        console.error("Error fetching office:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOffice();
  }, [officeId]);
  
  if (loading) return <Skeleton className="h-4 w-32" />;
  
  return (
    <div className="font-medium">
      {office?.Name || `Sucursal ${officeId}`}
    </div>
  );
});

// Component to display all losses in a tooltip
const LossesInfo = React.memo(function LossesInfo({ incident }: { incident: Incident }) {
  const cashLoss = parseNumeric(incident.CashLoss || incident.cashLoss);
  const merchandiseLoss = parseNumeric(incident.MerchandiseLoss || incident.merchandiseLoss);
  const otherLosses = parseNumeric(incident.OtherLosses || incident.otherLosses);
  const totalLoss = parseNumeric(incident.TotalLoss || incident.totalLoss);
  
  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 font-medium">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>{formatCurrency(totalLoss)}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="w-48">
          <div className="space-y-1">
            <p className="font-semibold text-sm mb-1">Desglose de pérdidas</p>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Efectivo:</span>
              <span>{formatCurrency(cashLoss)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Mercadería:</span>
              <span>{formatCurrency(merchandiseLoss)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Otros:</span>
              <span>{formatCurrency(otherLosses)}</span>
            </div>
            <div className="border-t border-border pt-1 mt-1 flex justify-between text-xs font-medium">
              <span>Total:</span>
              <span>{formatCurrency(totalLoss)}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
});

// Skeleton row for loading state
const SkeletonRow = React.memo(function SkeletonRow() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
    </TableRow>
  );
});

export function IncidentsTable() {
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const { data, isLoading, isFetching, isError } = useIncidents(page, pageSize);

  // Calculate total pages based on data count
  const totalPages = Math.ceil((data?.count || 0) / pageSize);

  // Memoize the table rows for better performance
  const tableRows = useMemo(() => {
    if (isLoading || isFetching) {
      return Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />);
    }
    
    if (!data?.results?.length) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
            No se encontraron incidentes
          </TableCell>
        </TableRow>
      );
    }
    
    return data.results.map((inc: Incident) => {
      const formattedDate = formatDate(inc.Date || inc.date, inc.Time || inc.time);
      const officeId = inc.Office || inc.officeId;
      const incidentTypeId = inc.IncidentType || Number(inc.incidentTypeId) || 0;
      
      return (
        <TableRow 
          key={inc.id} 
          className="group hover:bg-muted/30 transition-colors border-t border-border/50"
        >
          {/* ID */}
          <TableCell className="py-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Hash className="h-3.5 w-3.5" />
              <span>{inc.id}</span>
            </div>
          </TableCell>
          
          {/* Date */}
          <TableCell className="py-3">
            <div className="flex flex-col">
              <div>
                <div className="font-medium">{formattedDate.date}</div>
                <div className="text-sm text-muted-foreground">{formattedDate.time}</div>
              </div>
            </div>
          </TableCell>
          
          {/* Type */}
          <TableCell className="py-3">
            <IncidentTypeInfo typeId={incidentTypeId} />
          </TableCell>
          
          {/* Office */}
          <TableCell className="py-3">
            {officeId ? <OfficeInfo officeId={officeId} /> : '-'}
          </TableCell>
          
          {/* Description */}
          <TableCell className="py-3">
            <div className="space-y-1.5">
              <div className="text-sm line-clamp-2">
                {inc.Description || inc.description || "Sin descripción"}
              </div>
              {inc.Suspects?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {inc.Suspects.map((suspectId) => (
                    <div key={suspectId} className="bg-muted/50 rounded-full px-2 py-0.5 text-xs">
                      <SuspectInfo suspectId={suspectId} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TableCell>
          
          {/* Total Loss */}
          <TableCell className="py-3 text-right">
            <LossesInfo incident={inc} />
          </TableCell>
        </TableRow>
      );
    });
  }, [data, isLoading, isFetching]);

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Error al cargar los datos. Por favor, intente nuevamente más tarde.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4"> 
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar incidentes..."
            className="pl-8"
          />
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>FECHA Y HORA</TableHead>
              <TableHead>TIPO</TableHead>
              <TableHead>SUCURSAL</TableHead>
              <TableHead>DETALLES</TableHead>
              <TableHead className="text-right">PÉRDIDA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{tableRows}</TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setPage(page - 1);
                  }}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => {
                const pageNum = i + 1;
                
                // Always show first and last page, current page, and 1 page around current
                if (
                  pageNum === 1 || 
                  pageNum === totalPages || 
                  (pageNum >= page - 1 && pageNum <= page + 1)
                ) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(pageNum);
                        }}
                        isActive={page === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                
                // Show ellipsis between gaps
                if (pageNum === 2 && page > 3) {
                  return <PaginationItem key="start-ellipsis"><span className="px-2">...</span></PaginationItem>;
                }
                
                if (pageNum === totalPages - 1 && page < totalPages - 2) {
                  return <PaginationItem key="end-ellipsis"><span className="px-2">...</span></PaginationItem>;
                }
                
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) setPage(page + 1);
                  }}
                  className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      
      {/* Status and error indicators */}
      <div className="text-sm flex items-center justify-end gap-2 mt-2 min-h-6">
        {isLoading || isFetching ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>{isLoading ? 'Cargando...' : 'Actualizando...'}</span>
          </div>
        ) : isError ? (
          <div className="text-destructive">Error al cargar los incidentes</div>
        ) : null}
      </div>
    </div>
  );
}
