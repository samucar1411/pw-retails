'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu,
} from "@/components/ui/dropdown-menu"

import { mockIncidentList } from './preview/mock-data'; 
import { branchOptions, incidentTypes } from '@/validators/incident';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const getBranchName = (branchId: string) => {
  const branch = branchOptions.find(b => b.value === branchId);
  return branch ? branch.label : branchId;
};

const getIncidentTypeName = (typeId: string) => {
  const type = incidentTypes.find(t => t.value === typeId);
  return type ? type.label : typeId;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-PY', { 
    style: 'currency', 
    currency: 'PYG',
    maximumFractionDigits: 0 
  }).format(amount);
};

export default function IncidentsPage() {
  const router = useRouter();

  const handleViewDetails = (incidentId: string) => {
    router.push(`/dashboard/incidentes/${incidentId}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Incidentes</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/incidentes/preview/demo" passHref>
            <Button variant="outline">Ver Demostración</Button>
          </Link>
          <Link href="/dashboard/incidentes/nuevo" passHref>
            <Button>Nuevo Incidente</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Incidentes Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  ID Incidente
                </TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Sucursal</TableHead>
                <TableHead className="hidden md:table-cell">Fecha</TableHead>
                <TableHead className="text-right">Pérdida Total</TableHead>
                <TableHead><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockIncidentList.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="hidden sm:table-cell font-medium">
                    {incident.id}
                  </TableCell>
                  <TableCell>
                    <Badge variant={incident.type === 'hurto' || incident.type === 'robo' ? 'destructive' : 'outline'}>
                      {getIncidentTypeName(incident.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>{getBranchName(incident.branchId)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {format(new Date(incident.date + 'T' + incident.time), "dd/MM/yy HH:mm", { locale: es })}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(incident.total)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(incident.id)}
                      >
                        Ver Detalles
                      </Button>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {mockIncidentList.length === 0 && (
             <p className="text-center text-muted-foreground py-8">No hay incidentes registrados.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 