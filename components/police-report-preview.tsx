'use client';

import React from 'react';
import { 
  User,
  CalendarClock,
  FileWarning,
  ClipboardList,
  MapPin,
  DollarSign,
  Building,
  Phone,
  Mail,
  FileText,
  Tag
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Incident } from '@/types/incident';
import { Suspect } from '@/types/suspect';
import { Office } from '@/types/office';

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
  office?: Office | null;
  companyLogo?: string | null;
}

// Helper functions
const getBranchName = (office: number | string | Office) => {
  if (typeof office === 'object' && office !== null) {
    return office.Name || `Oficina ${office.id}`;
  }
  const id = typeof office === 'string' ? parseInt(office, 10) : office;
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

export function PoliceReportPreview({ 
  incidentData, 
  suspects = [], 
  incidentTypes = [], 
  office = null,
  companyLogo = null 
}: PoliceReportPreviewProps) {
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

  // Calculate total from detailed items if available
  const detailedMerchandiseTotal = incidentData.incidentLossItem?.reduce((sum, item) => sum + item.total, 0) || 0;

  return (
    <div id="police-report" className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border print:shadow-none print:border-none print:bg-white">
      {/* Cabecera del reporte */}
      <div className="flex items-center justify-between border-b p-6 print:p-4">
        <div className="flex items-center">
          {companyLogo && (
            <div className="w-12 h-12 mr-4 relative">
              <Image
                src={companyLogo}
                alt="Logo de la empresa"
                fill
                className="object-contain"
              />
            </div>
          )}
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
             <div className="flex items-center gap-1">
               <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
               <p className="font-medium">{getBranchName(incidentData.Office)}</p>
             </div>
           </div>
         </div>
         
         {/* Información detallada de la sucursal */}
         {office && (
           <div className="mt-4 p-4 bg-muted/10 rounded-md">
             <div className="flex items-center gap-2 mb-2">
               <Building className="h-4 w-4 text-primary" />
               <h3 className="font-medium">Información de la Sucursal</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
               <div>
                 <p className="text-muted-foreground">Nombre</p>
                 <p className="font-medium">{office.Name}</p>
               </div>
               {office.Address && (
                 <div>
                   <p className="text-muted-foreground">Dirección</p>
                   <p className="font-medium">{office.Address}</p>
                 </div>
               )}
               {office.Phone && (
                 <div>
                   <p className="text-muted-foreground">Teléfono</p>
                   <div className="flex items-center gap-1">
                     <Phone className="h-3 w-3 text-muted-foreground" />
                     <p className="font-medium">{office.Phone}</p>
                   </div>
                 </div>
               )}
               {office.Email && (
                 <div>
                   <p className="text-muted-foreground">Email</p>
                   <div className="flex items-center gap-1">
                     <Mail className="h-3 w-3 text-muted-foreground" />
                     <p className="font-medium">{office.Email}</p>
                   </div>
                 </div>
               )}
             </div>
           </div>
         )}
      </div>
      
      {/* Descripción de los hechos */}
      <div className="p-6 print:p-4 border-b">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Descripción de los hechos</h2>
        </div>
        <div className="mb-5">
          <div className="bg-muted/10 p-4 rounded-md">
            <p className="whitespace-pre-line">{incidentData.Description || 'Sin descripción disponible'}</p>
          </div>
        </div>
        
        {/* Bienes afectados */}
        <div className="mt-6">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-destructive" />
            Bienes afectados y valoración
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
          
          {/* Detalle de mercadería si existe */}
          {incidentData.incidentLossItem && incidentData.incidentLossItem.length > 0 && (
            <div className="mt-4 p-4 bg-muted/10 rounded-md">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Detalle de Mercadería
              </h4>
              <div className="space-y-2">
                {incidentData.incidentLossItem.map((item, index) => (
                  <div key={item.id || index} className="flex justify-between items-center p-2 bg-white rounded border">
                    <div>
                      <p className="font-medium text-sm">{item.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} unidades x {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <span className="font-medium">{formatCurrency(item.total)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center font-medium">
                    <span>Total Mercadería</span>
                    <span>{formatCurrency(detailedMerchandiseTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
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
              <Card key={suspect.id} className="overflow-hidden shadow-none border">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{suspect.Alias}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={suspect.Status === 1 ? 'default' : 'outline'} className="text-xs">
                          {suspect.Status === 1 ? 'Detenido' : 'Libre/No ID'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">ID: {suspect.id}</span>
                      </div>
                    </div>
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
                    <div className="flex-grow space-y-3">
                      {suspect.PhysicalDescription && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Descripción física</p>
                          <p className="text-sm whitespace-pre-line">{suspect.PhysicalDescription}</p>
                        </div>
                      )}
                      {suspect.Tags && suspect.Tags.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Características</p>
                          <div className="flex flex-wrap gap-1">
                            {suspect.Tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Información adicional</h2>
          </div>
          <div className="bg-muted/10 p-4 rounded-md">
            <p className="whitespace-pre-line">{incidentData.Notes}</p>
          </div>
        </div>
      )}
      
      {/* Firmas y validación */}
      <div className="p-6 print:p-4 border-b">
        <h2 className="text-lg font-semibold mb-4">Firmas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6">
          <div className="text-center">
            <div className="border-b border-dashed border-gray-300 pb-2 mb-2">&nbsp;</div>
            <p className="text-sm">Denunciante</p>
          </div>
          <div className="text-center">
            <div className="border-b border-dashed border-gray-300 pb-2 mb-2">&nbsp;</div>
            <p className="text-sm">Oficial de policía</p>
          </div>
        </div>
      </div>
      
      {/* Pie de página */}
      <div className="border-t p-6 print:p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Documento oficial de denuncia policial - PW Retails
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Generado el {format(new Date(), "PPP 'a las' HH:mm", { locale: es })}
        </p>
      </div>
    </div>
  );
} 