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
import { MapPin } from "lucide-react";
import { Incident } from "@/types/incident";
import { FileText } from "lucide-react";

interface RecentIncidentsTableProps {
  data: Incident[];
}

// Helper to determine badge variant based on incident type
const getIncidentTypeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (type.toLowerCase()) {
    case 'hurto':
      return 'destructive';
    case 'vandalismo':
      return 'outline';
    default:
      return 'secondary';
  }
};

export function RecentIncidentsTable({ data }: RecentIncidentsTableProps) {
  const recentIncidents = React.useMemo(() => {
    return [...data]
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);
  }, [data]);

  const isEmpty = recentIncidents.length === 0;

  return (
    <Card className="lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Incidentes recientes</CardTitle>
          <CardDescription>Últimos 5 incidentes reportados</CardDescription>
        </div>
        <Button variant="outline" size="sm">Ver todos</Button>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <FileText className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm font-medium">No hay incidentes recientes</p>
            <p className="text-xs">No se han registrado incidentes aún</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Sucursal</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Pérdidas</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium">{incident.id}</TableCell>
                  <TableCell>{`${incident.date} - ${incident.time}`}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {incident.officeId}
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getIncidentTypeVariant(incident.incidentTypeId.toString())} className="text-xs">
                      {incident.incidentTypeId}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {incident.totalLoss ? `$${incident.totalLoss.toLocaleString()}` : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                      Ver detalle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
} 