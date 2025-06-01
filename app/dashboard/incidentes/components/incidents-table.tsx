// components/IncidentsTable.tsx
"use client";

import {
  Pagination, PaginationContent, PaginationItem,
  PaginationPrevious, PaginationLink, PaginationNext
} from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { useIncidents } from "@/hooks/use-incident";
import { Incident } from "@/types/incident";
import { Hash, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import React, { useMemo } from "react";
import { formatDate } from "@/lib/date-format";
import { ErrorDisplay } from "@/components/ui/error-display";
import { LoadingState } from "@/components/ui/loading-state";
import { withErrorBoundary } from "@/components/error-boundary";

// Import extracted components
import { SuspectInfo } from "./suspect-info";
import { IncidentTypeInfo } from "./incident-type-info";
import { OfficeInfo } from "./office-info";
import { LossesInfo } from "./losses-info";

// Skeleton row for loading state
const SkeletonRow = React.memo(function SkeletonRow() {
  return (
    <TableRow>
      <TableCell><LoadingState variant="inline" /></TableCell>
      <TableCell><LoadingState variant="inline" /></TableCell>
      <TableCell><LoadingState variant="inline" /></TableCell>
      <TableCell><LoadingState variant="inline" /></TableCell>
      <TableCell><LoadingState variant="inline" /></TableCell>
      <TableCell><LoadingState variant="inline" /></TableCell>
    </TableRow>
  );
});

function IncidentsTableComponent() {
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const { data, isLoading, isError, isFetching, refetch: refetchIncidents } = useIncidents(page, pageSize);

  const totalPages = Math.ceil((data?.count || 0) / pageSize);
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
              <Hash className="h-3.5 w-3.5 flex-shrink-0" />
              <Link 
                href={`/dashboard/incidentes/${inc.id}`}
                className="hover:underline hover:text-primary"
              >
                {inc.id.toString().slice(-8)}
              </Link>
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
      <ErrorDisplay 
        title="Error al cargar los datos" 
        message="No se pudieron cargar los incidentes." 
        error={new Error('Error al cargar los incidentes')} 
        retry={refetchIncidents}
      />
    );
  }

  return (
    <div className="w-full"> 
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
        ) : null}
      </div>
    </div>
  );
}

// Export the component wrapped with error boundary
export const IncidentsTable = withErrorBoundary(IncidentsTableComponent);
