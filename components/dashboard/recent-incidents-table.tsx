"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, MapPin, Loader2, Hash } from "lucide-react";
import Link from "next/link";
import { Incident, IncidentType } from "@/types/incident";
import { Office } from "@/types/office";
import { getOffice } from "@/services/office-service";
import { getIncidentType } from "@/services/incident-service";
import { usePaginatedIncidents } from "@/hooks/usePaginatedIncidents";
import { useState, useEffect } from "react";

interface RecentIncidentsTableProps {
  fromDate: string;
  toDate: string;
  officeId: string;
}



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

// Component to display office information
const OfficeInfo = React.memo(function OfficeInfo({ officeId }: { officeId: number }) {
  const [office, setOffice] = useState<Office | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchOffice = async () => {
      try {
        const officeData = await getOffice(officeId);
        setOffice(officeData);
      } catch (error) {
        console.error("Error fetching office:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOffice();
  }, [officeId]);
  
  if (loading) return <Skeleton className="h-4 w-24" />;
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1.5 cursor-help">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium">{office?.Name || `Sucursal ${officeId}`}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-sm space-y-1">
        <p className="font-medium">{office?.Name || `Sucursal ${officeId}`}</p>
        {office?.Address && <p className="text-xs">{office.Address}</p>}
        {office?.Code && <p className="text-xs text-muted-foreground">Código: {office.Code}</p>}
      </TooltipContent>
    </Tooltip>
  );
});

// Component to display incident type with tooltip
const IncidentTypeInfo = React.memo(function IncidentTypeInfo({ typeId }: { typeId: number }) {
  const [incidentType, setIncidentType] = useState<IncidentType | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchIncidentType = async () => {
      try {
        const type = await getIncidentType(typeId);
        setIncidentType(type);
      } catch (error) {
        console.error("Error fetching incident type:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchIncidentType();
  }, [typeId]);
  
  if (loading) return <Skeleton className="h-4 w-20" />;
  
  // Determine badge variant based on incident type
  const getVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (!incidentType?.Name) return 'secondary';
    
    const type = incidentType.Name.toLowerCase();
    if (type.includes('hurto')) return 'destructive';
    if (type.includes('robo')) return 'destructive';
    if (type.includes('vandalismo')) return 'outline';
    return 'secondary';
  };
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant={getVariant()} className="text-xs font-medium">
          {incidentType?.Name || `Tipo ${typeId}`}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-sm">
        <p>Tipo de incidente: {incidentType?.Name || `Tipo ${typeId}`}</p>
      </TooltipContent>
    </Tooltip>
  );
});

// Component to display loss information with tooltip
const LossesInfo = React.memo(function LossesInfo({ incident }: { incident: Incident }) {
  // Handle both API field names (uppercase) and local field names (lowercase)
  const cashLoss = parseNumeric(incident.CashLoss || incident.cashLoss);
  const merchandiseLoss = parseNumeric(incident.MerchandiseLoss || incident.merchandiseLoss);
  const otherLosses = parseNumeric(incident.OtherLosses || incident.otherLosses);
  const totalLoss = parseNumeric(incident.TotalLoss || incident.totalLoss);
  
  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="font-medium cursor-help">
            <span>{formatCurrency(totalLoss)}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="text-sm space-y-1">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span>Efectivo:</span>
            <span>{formatCurrency(cashLoss)}</span>
            
            <span>Mercancía:</span>
            <span>{formatCurrency(merchandiseLoss)}</span>
            
            <span>Otros:</span>
            <span>{formatCurrency(otherLosses)}</span>
            
            <div className="col-span-2 border-t mt-1 pt-1 flex justify-between font-medium">
              <span>Total:</span>
              <span>{formatCurrency(totalLoss)}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
});

export function RecentIncidentsTable({ fromDate, toDate, officeId }: RecentIncidentsTableProps) {
  const { 
    data: incidents = [], 
    isLoading, 
    error 
  } = usePaginatedIncidents(fromDate, toDate, officeId);

  const recentIncidents = React.useMemo(() => {
    return [...incidents]
      .sort((a, b) => {
        const dateA = new Date(`${a.Date}T${a.Time}`);
        const dateB = new Date(`${b.Date}T${b.Time}`);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);
  }, [incidents]);

  // Build link to all incidents with filters
  const allIncidentsLink = React.useMemo(() => {
    let link = `/dashboard/incidentes?Date_after=${fromDate}&Date_before=${toDate}`;
    if (officeId && officeId !== '') {
      link += `&Office=${officeId}`;
    }
    return link;
  }, [fromDate, toDate, officeId]);

  if (isLoading) {
    return (
      <Card className="lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Incidentes recientes</CardTitle>
            <CardDescription>Últimos 5 incidentes reportados</CardDescription>
          </div>
          <Link href={allIncidentsLink}>
            <Button variant="outline" size="sm">Ver todos</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Incidentes recientes</CardTitle>
            <CardDescription>Últimos 5 incidentes reportados</CardDescription>
          </div>
          <Link href={allIncidentsLink}>
            <Button variant="outline" size="sm">Ver todos</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">Error al cargar incidentes</div>
        </CardContent>
      </Card>
    );
  }

  const isEmpty = recentIncidents.length === 0;

  return (
    <Card className="lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Incidentes recientes</CardTitle>
          <CardDescription>Últimos 5 incidentes reportados</CardDescription>
        </div>
        <Link href={allIncidentsLink}>
          <Button variant="outline" size="sm">Ver todos</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <FileText className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm font-medium">No hay incidentes recientes</p>
            <p className="text-xs">No se han registrado incidentes en este período</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>FECHA</TableHead>
                  <TableHead>SUCURSAL</TableHead>
                  <TableHead>TIPO</TableHead>
                  <TableHead>PÉRDIDAS</TableHead>
                  <TableHead className="text-right">ACCIÓN</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentIncidents.map((incident) => {
                  // Handle both API field names (uppercase) and local field names (lowercase)
                  
                  return (
                    <TableRow key={incident.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Hash className="h-3.5 w-3.5 flex-shrink-0" />
                          <Link 
                            href={`/dashboard/incidentes/${incident.id}`}
                            className="hover:underline hover:text-primary"
                          >
                            {incident.id.toString().slice(-8)}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {incident.Date ? new Date(incident.Date).toLocaleDateString('es-PY', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: '2-digit' 
                          }) : 'Sin fecha'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {(incident.officeId || incident.Office) && 
                          <OfficeInfo officeId={incident.officeId || incident.Office} />}
                      </TableCell>
                      <TableCell>
                        {(incident.incidentTypeId || incident.IncidentType) && 
                          <IncidentTypeInfo typeId={incident.incidentTypeId || incident.IncidentType} />}
                      </TableCell>
                      <TableCell>
                        <LossesInfo incident={incident} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/incidentes/${incident.id}`}>
                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                            Ver detalle
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 