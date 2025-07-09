// components/IncidentsTable.tsx
"use client";

import {
  Pagination, PaginationContent, PaginationItem,
  PaginationPrevious, PaginationLink, PaginationNext
} from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Incident } from "@/types/incident";
import { Hash, RefreshCw } from "lucide-react";
import React, { useMemo } from "react";


import { withErrorBoundary } from "@/components/error-boundary";

// Import extracted components
import { SuspectInfo } from "./suspect-info";
import { IncidentTypeInfo } from "./incident-type-info";
import { OfficeInfo } from "./office-info";
import { LossesInfo } from "./losses-info";

interface IncidentsTableProps {
  incidents: Incident[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => Promise<void>;
  onRefresh: () => Promise<void>;
}

function IncidentsTableComponent({ 
  incidents, 
  currentPage, 
  totalPages, 
  onPageChange, 
  onRefresh 
}: IncidentsTableProps) {

  const tableRows = useMemo(() => {
    if (!incidents?.length) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
            No se encontraron incidentes
          </TableCell>
        </TableRow>
      );
    }
    
    return incidents.map((inc: Incident) => {
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
            <div className="font-medium">
              {inc.Date ? new Date(inc.Date).toLocaleDateString('es-PY', { 
                day: '2-digit', 
                month: '2-digit', 
                year: '2-digit' 
              }) : 'Sin fecha'}
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
          <TableCell className="py-3">
            <LossesInfo incident={inc} />
          </TableCell>
        </TableRow>
      );
    });
  }, [incidents]);

  return (
    <div className="w-full"> 
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>FECHA Y HORA</TableHead>
              <TableHead>TIPO</TableHead>
              <TableHead>SUCURSAL</TableHead>
              <TableHead>DETALLES</TableHead>
              <TableHead>PÉRDIDA</TableHead>
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
                    if (currentPage > 1) onPageChange(currentPage - 1);
                  }}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => {
                const pageNum = i + 1;
                
                // Always show first and last page, current page, and 1 page around current
                if (
                  pageNum === 1 || 
                  pageNum === totalPages || 
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          onPageChange(pageNum);
                        }}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                
                // Show ellipsis between gaps
                if (pageNum === 2 && currentPage > 3) {
                  return <PaginationItem key="start-ellipsis"><span className="px-2">...</span></PaginationItem>;
                }
                
                if (pageNum === totalPages - 1 && currentPage < totalPages - 2) {
                  return <PaginationItem key="end-ellipsis"><span className="px-2">...</span></PaginationItem>;
                }
                
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) onPageChange(currentPage + 1);
                  }}
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      
      {/* Refresh button */}
      <div className="flex justify-end mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>
    </div>
  );
}

// Export the component wrapped with error boundary
export const IncidentsTable = withErrorBoundary(IncidentsTableComponent);
