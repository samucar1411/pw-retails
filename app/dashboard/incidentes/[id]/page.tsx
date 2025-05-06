'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Info, DollarSign, Users, MapPin, FileText, AlertTriangle,
  Calendar, Clock, Building, FileImage, Download, Printer, Share2
} from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PoliceReportPreview } from '@/components/police-report-preview';
import { mockIncidentList } from '../preview/mock-data';
import { branchOptions, incidentTypes } from '@/validators/incident';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos
type Suspect = {
  id: string;
  alias: string;
  status: string;
  description?: string;
  imageUrl?: string;
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
  notes?: string;
  attachments?: AttachmentMetadata[];
  created_at: string;
};

type AttachmentMetadata = {
  name: string;
  type: string;
  size: number;
};

// Funciones auxiliares
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(amount);
};

const getBranch = (branchId: string) => {
  return branchOptions.find(b => b.value === branchId);
};

const getIncidentTypeName = (typeId: string) => {
  const type = incidentTypes.find(t => t.value === typeId);
  return type ? type.label : typeId;
};

// Componente Mapa Simulado
function SimulatedMap({ address }: { address?: string }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5"/> Ubicación</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-[200px] bg-muted/30 flex items-center justify-center">
          <div className="text-center p-4">
            <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{address || 'Dirección no disponible'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function IncidentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const incidentId = params.id as string; 

  const [incidentData, setIncidentData] = useState<IncidentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumen');

  useEffect(() => {
    if (incidentId) {
      const foundIncident = mockIncidentList.find(inc => inc.id === incidentId);
      if (foundIncident) {
        setIncidentData(JSON.parse(JSON.stringify(foundIncident)));
      } else {
        console.error("Incidente no encontrado:", incidentId);
      }
      setLoading(false);
    }
  }, [incidentId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-200px)]"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div></div>;
  }

  if (!incidentData) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Incidente no encontrado</h1>
        <p className="text-muted-foreground mb-6">ID: {incidentId}</p>
        <Button onClick={() => router.push('/dashboard/incidentes')}><ArrowLeft className="mr-2 h-4 w-4"/> Volver al listado</Button>
      </div>
    );
  }
  
  const branch = getBranch(incidentData.branchId);
  const formattedDateTime = format(new Date(`${incidentData.date}T${incidentData.time}`), "PPP 'a las' HH:mm", { locale: es });
  const hasSuspects = Array.isArray(incidentData.suspects) && incidentData.suspects.length > 0;
  const hasAttachments = Array.isArray(incidentData.attachments) && incidentData.attachments.length > 0;

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Cabecera con Título y Botones de Acción */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/incidentes')} className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Expediente de Incidente</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>ID: {incidentData.id}</span>
              <Badge variant={incidentData.type === 'hurto' || incidentData.type === 'robo' ? 'destructive' : 'secondary'}>
                {getIncidentTypeName(incidentData.type)}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Compartir
          </Button>
        </div>
      </div>

      {/* Tabs de Navegación */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="detalles">Detalles</TabsTrigger>
          <TabsTrigger value="sospechosos">Sospechosos</TabsTrigger>
          <TabsTrigger value="adjuntos">Adjuntos</TabsTrigger>
        </TabsList>

        {/* Tab Resumen */}
        <TabsContent value="resumen" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna Izquierda (Detalles principales) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Información Básica */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><Info className="h-5 w-5"/> Información Básica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Sucursal</p>
                        <p className="text-muted-foreground">{branch?.label || incidentData.branchId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Fecha</p>
                        <p className="text-muted-foreground">{format(new Date(incidentData.date), "PPP", { locale: es })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Hora</p>
                        <p className="text-muted-foreground">{format(new Date(`2000-01-01T${incidentData.time}`), "HH:mm", { locale: es })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Tipo de Incidente</p>
                        <Badge variant={incidentData.type === 'hurto' || incidentData.type === 'robo' ? 'destructive' : 'secondary'}>
                          {getIncidentTypeName(incidentData.type)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Descripción */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5"/> Descripción del Hecho</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{incidentData.description || "-"}</p>
                  {incidentData.notes && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <h3 className="font-semibold mb-2 text-sm">Notas Adicionales</h3>
                        <p className="text-sm text-muted-foreground">{incidentData.notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Columna Derecha (Pérdidas y Ubicación) */}
            <div className="space-y-6">
              {/* Pérdidas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><DollarSign className="h-5 w-5"/> Pérdidas Estimadas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-3xl font-bold">{formatCurrency(incidentData.total)}</p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Efectivo</p>
                      <p className="font-medium">{formatCurrency(incidentData.cash)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Mercadería</p>
                      <p className="font-medium">{formatCurrency(incidentData.merchandise)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Otros</p>
                      <p className="font-medium">{formatCurrency(incidentData.otherLosses)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ubicación */}
              <SimulatedMap address={branch?.address} />
            </div>
          </div>
        </TabsContent>

        {/* Tab Detalles */}
        <TabsContent value="detalles">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5"/> Detalles Completos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Información del Incidente</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium">ID del Incidente</dt>
                      <dd className="text-sm text-muted-foreground">{incidentData.id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium">Fecha y Hora</dt>
                      <dd className="text-sm text-muted-foreground">{formattedDateTime}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium">Tipo de Incidente</dt>
                      <dd className="text-sm text-muted-foreground">{getIncidentTypeName(incidentData.type)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium">Sucursal</dt>
                      <dd className="text-sm text-muted-foreground">{branch?.label || incidentData.branchId}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium">Dirección</dt>
                      <dd className="text-sm text-muted-foreground">{branch?.address || "No disponible"}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Detalles de Pérdidas</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium">Pérdida Total</dt>
                      <dd className="text-sm text-muted-foreground">{formatCurrency(incidentData.total)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium">Efectivo</dt>
                      <dd className="text-sm text-muted-foreground">{formatCurrency(incidentData.cash)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium">Mercadería</dt>
                      <dd className="text-sm text-muted-foreground">{formatCurrency(incidentData.merchandise)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium">Otras Pérdidas</dt>
                      <dd className="text-sm text-muted-foreground">{formatCurrency(incidentData.otherLosses)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Descripción Detallada</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{incidentData.description || "-"}</p>
                {incidentData.notes && (
                  <>
                    <Separator className="my-4" />
                    <h3 className="font-semibold mb-2">Notas Adicionales</h3>
                    <p className="text-sm text-muted-foreground">{incidentData.notes}</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Sospechosos */}
        <TabsContent value="sospechosos">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5"/> Sospechosos Identificados</CardTitle>
            </CardHeader>
            <CardContent>
              {hasSuspects ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {incidentData.suspects!.map((suspect) => (
                    <Card key={suspect.id} className="overflow-hidden">
                      <div className="flex items-start gap-4 p-4">
                        <div className="w-16 h-16 rounded-full bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {suspect.imageUrl ? (
                            <Image src={suspect.imageUrl} alt={suspect.alias} width={64} height={64} className="object-cover" />
                          ) : (
                            <Users className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{suspect.alias}</h3>
                              <Badge variant={suspect.status === 'detenido' ? 'default' : 'outline'} className="mt-1">
                                {suspect.status === 'detenido' ? 'Detenido' : 'Libre'}
                              </Badge>
                            </div>
                          </div>
                          {suspect.description && (
                            <p className="text-sm text-muted-foreground mt-2">{suspect.description}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic text-center py-4">No hay sospechosos registrados.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Adjuntos */}
        <TabsContent value="adjuntos">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><FileImage className="h-5 w-5"/> Archivos Adjuntos</CardTitle>
            </CardHeader>
            <CardContent>
              {hasAttachments ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {incidentData.attachments!.map((file, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="flex items-center gap-4 p-4">
                        <div className="w-12 h-12 rounded bg-muted flex-shrink-0 flex items-center justify-center">
                          <FileImage className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium text-sm truncate" title={file.name}>{file.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic text-center py-4">No hay archivos adjuntos.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sección Denuncia Policial */}
      <div className="mt-12">
        <Separator />
        <h2 className="text-xl md:text-2xl font-semibold mt-8 mb-6 text-center">Visualización de la Denuncia Policial</h2>
        <PoliceReportPreview incidentData={incidentData} />
      </div>
    </div>
  );
} 