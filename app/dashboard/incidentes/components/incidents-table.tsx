// components/IncidentsTable.tsx
"use client";

import {
  Pagination, PaginationContent, PaginationItem,
  PaginationPrevious, PaginationLink, PaginationNext
} from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Incident } from "@/types/incident";
import { RefreshCw } from "lucide-react";
import React, { useMemo } from "react";
import { IdCell } from "@/components/ui/id-cell";

import { withErrorBoundary } from "@/components/error-boundary";

// Import extracted components
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
      const officeId = inc.Office;
      const incidentTypeId = inc.IncidentType;
      
      return (
        <TableRow 
          key={inc.id} 
          className="group hover:bg-muted/30 transition-colors border-t border-border/50"
        >
          {/* ID */}
          <TableCell className="py-6">
            <IdCell id={inc.id} basePath="incidentes" />
          </TableCell>
          
          {/* Date */}
          <TableCell className="py-6">
            <div className="font-medium">
              {inc.Date ? new Date(inc.Date).toLocaleDateString('es-PY', { 
                day: '2-digit', 
                month: '2-digit', 
                year: '2-digit' 
              }) : 'Sin fecha'}
            </div>
          </TableCell>
          
          {/* Type */}
          <TableCell className="py-6">
            <IncidentTypeInfo typeId={incidentTypeId} />
          </TableCell>
          
          {/* Office */}
          <TableCell className="py-6">
            {officeId ? <OfficeInfo officeId={officeId} /> : '-'}
          </TableCell>
          
          {/* Description */}
          <TableCell className="py-6">
            <div className="text-sm line-clamp-2">
              {inc.Description || "Sin descripción"}
            </div>
          </TableCell>
          
          {/* Total Loss */}
          <TableCell className="py-6">
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
              <TableHead>Id</TableHead>
              <TableHead>Fecha y hora</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Sucursal</TableHead>
              <TableHead>Detalles</TableHead>
              <TableHead>Pérdida</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{tableRows}</TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-6">
        {totalPages > 1 && (
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
                
                // Show ellipsis for gaps
                if (
                  pageNum === 2 || 
                  pageNum === totalPages - 1
                ) {
                  return (
                    <PaginationItem key={pageNum}>
                      <span className="px-4">...</span>
                    </PaginationItem>
                  );
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
        )}

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

export const IncidentsTable = withErrorBoundary(IncidentsTableComponent);
