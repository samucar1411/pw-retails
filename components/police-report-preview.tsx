'use client';

import React from 'react';
import { 
  User,
  CalendarClock,
  ShieldAlert,
  FileWarning,
  ClipboardList
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { branchOptions, incidentTypes } from '@/validators/incident';

// Tipos
type Suspect = {
  id: string;
  alias: string;
  status: string;
  description?: string;
  imageUrl?: string;
};

// Tipo para los metadatos de adjuntos que guardamos
type AttachmentMetadata = {
  name: string;
  type: string;
  size: number;
};

type IncidentData = {
  id: string;
  branchId: string;
  date: string;
  time: string;
  type: string;
  description: string;
  cash: number;
  merchandise: number;
  otherLosses: number;
  total: number;
  suspects?: Suspect[];
  suspectAlias?: string; // Mantener por si acaso
  suspectStatus?: string; // Mantener por si acaso
  notes?: string;
  attachments?: AttachmentMetadata[]; // Usar el tipo definido
  created_at: string;
};

interface PoliceReportPreviewProps {
  incidentData: IncidentData;
}

// Funciones auxiliares (copiadas y adaptadas de la página de preview)
const getBranchName = (branchId: string) => {
  const branch = branchOptions.find(branch => branch.value === branchId);
  return branch ? branch.label : branchId;
};

const getIncidentTypeName = (typeId: string) => {
  const type = incidentTypes.find(type => type.value === typeId);
  return type ? type.label : typeId;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-PY', { 
    style: 'currency', 
    currency: 'PYG',
    maximumFractionDigits: 0
  }).format(amount);
};

export function PoliceReportPreview({ incidentData }: PoliceReportPreviewProps) {
  if (!incidentData) return null; // Manejar caso sin datos

  const formattedDate = format(new Date(`${incidentData.date}T${incidentData.time}`), "PPP 'a las' HH:mm", { locale: es });
  const hasSuspects = Array.isArray(incidentData.suspects) && incidentData.suspects.length > 0;

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
          <Badge variant={incidentData.type === 'hurto' ? 'destructive' : 'default'} className="mb-2">
            {getIncidentTypeName(incidentData.type)}
          </Badge>
          <p className="text-sm text-muted-foreground">
            Registrado el {format(new Date(incidentData.created_at), "PPP", { locale: es })}
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
             <p className="font-medium">{getBranchName(incidentData.branchId)}</p>
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
            <p>{incidentData.description}</p>
          </div>
        </div>
        {/* Bienes afectados */}
        <div className="mt-6">
          <h3 className="font-medium mb-3">Bienes afectados y valoración</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 border rounded-md"><p className="text-sm text-muted-foreground">Dinero</p><p className="font-medium">{formatCurrency(incidentData.cash)}</p></div>
            <div className="p-3 border rounded-md"><p className="text-sm text-muted-foreground">Mercadería</p><p className="font-medium">{formatCurrency(incidentData.merchandise)}</p></div>
            <div className="p-3 border rounded-md"><p className="text-sm text-muted-foreground">Otros daños</p><p className="font-medium">{formatCurrency(incidentData.otherLosses)}</p></div>
            <div className="p-3 border rounded-md bg-primary/5"><p className="text-sm text-muted-foreground">Total</p><p className="font-medium text-primary">{formatCurrency(incidentData.total)}</p></div>
          </div>
        </div>
      </div>
      
      {/* Información del sospechoso */}
      {(hasSuspects || incidentData.suspectAlias) && (
        <div className="p-6 print:p-4 border-b">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Datos de sospechosos</h2>
          </div>
          {hasSuspects ? (
            <div className="space-y-4">
              {incidentData.suspects!.map((suspect) => (
                <Card key={suspect.id} className="overflow-hidden shadow-none">
                  <CardHeader className="p-4 pb-2">
                     <div className="flex justify-between items-start">
                       <div>
                         <CardTitle className="text-base">{suspect.alias}</CardTitle>
                         <Badge variant={suspect.status === 'detenido' ? 'default' : 'outline'} className="mt-1">{suspect.status === 'detenido' ? 'Detenido' : 'Libre/No ID'}</Badge>
                       </div>
                       <div className="text-sm text-muted-foreground">ID: {suspect.id}</div>
                     </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="flex flex-col md:flex-row gap-4">
                      {suspect.imageUrl && (
                        <div className="w-full md:w-40 h-40 rounded-md overflow-hidden flex-shrink-0 border">
                          <img src={suspect.imageUrl} alt={`Foto de ${suspect.alias}`} className="w-full h-full object-cover"/>
                        </div>
                      )}
                      {suspect.description && (
                        <div className="flex-grow">
                          <p className="text-sm text-muted-foreground mb-1">Descripción física</p>
                          <p className="text-sm">{suspect.description}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : ( /* Fallback */
            <Card className="shadow-none">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><p className="text-sm text-muted-foreground">Alias</p><p className="font-medium">{incidentData.suspectAlias}</p></div>
                  {incidentData.suspectStatus && (<div><p className="text-sm text-muted-foreground">Estado</p><p className="font-medium">{incidentData.suspectStatus === 'detenido' ? 'Detenido' : 'Libre/No ID'}</p></div>)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {/* Notas adicionales */}
      {incidentData.notes && (
        <div className="p-6 print:p-4 border-b">
          <h2 className="text-lg font-semibold mb-3">Información adicional</h2>
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