'use client';

import React from 'react';
import { 
  User,
  CalendarClock,
  ShieldAlert,
  FileWarning,
  ClipboardList
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Incident } from '@/types/incident';
import { Suspect } from '@/types/suspect';

// TODO: Move this to a shared constants file
const branchOptions = [
  { value: '1', label: 'Sucursal Central' },
  { value: '2', label: 'Sucursal Norte' },
  { value: '3', label: 'Sucursal Sur' },
  // Add more branches as needed
];

interface PoliceReportPreviewProps {
  incidentData: Incident;
  suspects?: Suspect[];
  incidentTypes: Array<{id: number, name: string}>;
}

// Helper functions
const getBranchName = (officeId: number | string) => {
  const id = typeof officeId === 'string' ? parseInt(officeId, 10) : officeId;
  const branch = branchOptions.find((branch: {value: string, label: string}) => parseInt(branch.value, 10) === id);
  return branch ? branch.label : `Oficina ${id}`;
};

const getIncidentTypeName = (typeId: number, types: Array<{id: number, name: string}>) => {
  const type = types.find(type => type.id === typeId);
  return type ? type.name : `Tipo ${typeId}`;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-PY', { 
    style: 'currency', 
    currency: 'PYG',
    maximumFractionDigits: 0
  }).format(amount);
};

export function PoliceReportPreview({ incidentData, suspects = [], incidentTypes = [] }: PoliceReportPreviewProps) {
  if (!incidentData) return null;

  const formattedDate = format(
    parseISO(`${incidentData.Date}T${incidentData.Time}`), 
    "PPP 'a las' HH:mm", 
    { locale: es }
  );
  
  const hasSuspects = suspects.length > 0;
  const cashLoss = parseFloat(incidentData.CashLoss || '0') || 0;
  const merchandiseLoss = parseFloat(incidentData.MerchandiseLoss || '0') || 0;
  const otherLosses = parseFloat(incidentData.OtherLosses || '0') || 0;
  const totalLoss = parseFloat(incidentData.TotalLoss || '0') || (cashLoss + merchandiseLoss + otherLosses);

  return (
    <div id="police-report" className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border print:shadow-none print:border-none print:bg-white">
      {/* Cabecera del reporte */}
      <div className="flex items-center justify-between border-b p-6 print:p-4">
        <div className="flex items-center">
          <ShieldAlert className="h-8 w-8 text-primary mr-2" />
          <div>
            <h1 className="text-2xl font-bold">Denuncia Policial</h1>
            <p className="text-muted-foreground">Exp. No. {incidentData.id}</p>
          </div>
        </div>
        <div className="text-right">
          <Badge variant={incidentData.IncidentType === 1 ? 'destructive' : 'default'} className="mb-2">
            {getIncidentTypeName(incidentData.IncidentType, incidentTypes)}
          </Badge>
          <p className="text-muted-foreground">
            Registrado el {format(new Date(), "PPP", { locale: es })}
          </p>
        </div>
      </div>
      
      {/* Información del hecho denunciado */}
      <div className="border-b p-6 print:p-4">
         <div className="flex items-center gap-2 mb-4">
           <FileWarning className="h-5 w-5 text-primary" />
           <h2 className="text-lg font-semibold">Información del hecho denunciado</h2>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
             <p className="text-sm text-muted-foreground">Fecha y hora del incidente</p>
             <div className="flex items-center gap-1">
               <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
               <p>{formattedDate}</p>
             </div>
           </div>
           <div>
             <p className="text-sm text-muted-foreground">Lugar del incidente</p>
             <p className="font-medium">{getBranchName(incidentData.Office)}</p>
           </div>
         </div>
      </div>
      
      {/* Descripción de los hechos */}
      <div className="p-6 print:p-4 border-b">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Descripción de los hechos</h2>
        </div>
        <div className="mb-5">
          <div className="bg-muted/10 p-4 rounded-md">
            <p>{incidentData.Description}</p>
          </div>
        </div>
        {/* Bienes afectados */}
        <div className="mt-6">
          <h3 className="font-medium mb-3">Bienes afectados y valoración</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 border rounded-md">
              <p className="text-sm text-muted-foreground">Dinero</p>
              <p className="font-medium">{formatCurrency(cashLoss)}</p>
            </div>
            <div className="p-3 border rounded-md">
              <p className="text-sm text-muted-foreground">Mercadería</p>
              <p className="font-medium">{formatCurrency(merchandiseLoss)}</p>
            </div>
            <div className="p-3 border rounded-md">
              <p className="text-sm text-muted-foreground">Otros daños</p>
              <p className="font-medium">{formatCurrency(otherLosses)}</p>
            </div>
            <div className="p-3 border rounded-md bg-primary/5">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="font-medium text-primary">{formatCurrency(totalLoss)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Información del sospechoso */}
      {hasSuspects && (
        <div className="p-6 print:p-4 border-b">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Datos de sospechosos</h2>
          </div>
          <div className="space-y-4">
            {suspects.map((suspect) => (
              <Card key={suspect.id} className="overflow-hidden shadow-none">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{suspect.Alias}</CardTitle>
                      <Badge variant={suspect.Status === 1 ? 'default' : 'outline'} className="mt-1">
                        {suspect.Status === 1 ? 'Detenido' : 'Libre/No ID'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">ID: {suspect.id}</div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="flex flex-col md:flex-row gap-4">
                    {suspect.PhotoUrl && (
                      <div className="w-full md:w-40 h-40 rounded-md overflow-hidden flex-shrink-0 border">
                        <div className="relative w-full h-full">
                          <Image 
                            src={suspect.PhotoUrl} 
                            alt={`Foto de ${suspect.Alias}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 160px"
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}
                    {suspect.PhysicalDescription && (
                      <div className="flex-grow">
                        <p className="text-sm text-muted-foreground mb-1">Descripción física</p>
                        <p className="text-sm">{suspect.PhysicalDescription}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Notas adicionales */}
      {incidentData.Notes && (
        <div className="p-6 print:p-4 border-b">
          <h2 className="text-lg font-semibold mb-3">Información adicional</h2>
          <div className="bg-muted/10 p-4 rounded-md">
            <p>{incidentData.Notes}</p>
          </div>
          <p className="text-sm">{incidentData.notes}</p>
        </div>
      )}
      
      {/* Firmas y validación */}
      <div className="p-6 print:p-4 border-b">
        <h2 className="text-lg font-semibold mb-4">Firmas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6">
          <div className="text-center"><div className="border-b border-dashed border-gray-300 pb-2 mb-2">&nbsp;</div><p className="text-sm">Denunciante</p></div>
          <div className="text-center"><div className="border-b border-dashed border-gray-300 pb-2 mb-2">&nbsp;</div><p className="text-sm">Oficial de policía</p></div>
        </div>
      </div>
      
      {/* Pie de página */}
      <div className="border-t p-6 print:p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Documento oficial de denuncia policial...
        </p>
      </div>
    </div>
  );
} 