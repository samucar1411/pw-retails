'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Info, DollarSign, Users, MapPin, FileText, AlertTriangle,
  Calendar, Clock, Building, FileImage, Download, Printer, Share2, Loader2
} from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PoliceReportPreview } from '@/components/police-report-preview';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { getIncidentById } from '@/services/incident-service';
import { getIncidentTypes } from '@/services/incident-type-service';
import { getSuspectById } from '@/services/suspect-service';
import Map from '@/components/ui/map';
import { Incident } from '@/types/incident';
import { Suspect } from '@/types/suspect';
import { getOffice } from '@/services/office-service';
import { Office } from '@/types/office';

const formatCurrency = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null || value === '') return '$0';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '$0';
  return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(numValue);
};

const getTotalLoss = (incident: Incident): string => {
  if (incident.TotalLoss) return formatCurrency(incident.TotalLoss);
  // Then try totalLoss (lowercase field)
  if (incident.totalLoss) return formatCurrency(incident.totalLoss);
  
  // Calculate from individual components if available
  let total = 0;
  
  // Handle CashLoss
  if (incident.CashLoss) {
    total += parseFloat(incident.CashLoss);
  } else if (incident.cashLoss !== undefined) {
    total += typeof incident.cashLoss === 'string' ? parseFloat(incident.cashLoss) : (incident.cashLoss || 0);
  }
  
  // Handle MerchandiseLoss
  if (incident.MerchandiseLoss) {
    total += parseFloat(incident.MerchandiseLoss);
  } else if (incident.merchandiseLoss !== undefined) {
    total += typeof incident.merchandiseLoss === 'string' ? parseFloat(incident.merchandiseLoss) : (incident.merchandiseLoss || 0);
  }
  
  // Handle OtherLosses
  if (incident.OtherLosses) {
    total += parseFloat(incident.OtherLosses);
  } else if (incident.otherLosses !== undefined) {
    total += typeof incident.otherLosses === 'string' ? parseFloat(incident.otherLosses) : (incident.otherLosses || 0);
  }
  
  return formatCurrency(total);
};

const getOfficeName = (officeId: number | undefined): string => {
  if (!officeId) return 'No especificada';
  return `Oficina ${officeId}`; // Temporary placeholder until the office data is loaded
};

const getIncidentTypeName = (typeId: string | number | undefined, incidentTypes: Array<{id: number, name: string}>): string => {
  if (!typeId) return 'No especificado';
  const id = typeof typeId === 'number' ? typeId : parseInt(typeId, 10);
  const type = incidentTypes.find(t => t.id === id);
  return type ? type.name : `Tipo ${id}`;
};

// Componente para mostrar el mapa con la ubicación del incidente
function IncidentLocationMap({ latitude, longitude, title }: { latitude?: number; longitude?: number; title: string }) {
  // Si no hay coordenadas, mostrar un mensaje
  if (!latitude || !longitude) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5"/> Ubicación</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative h-[300px] bg-muted/30 flex items-center justify-center">
            <div className="text-center p-4">
              <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Ubicación no disponible</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Si hay coordenadas, mostrar el mapa
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5"/> Ubicación del Incidente</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-[300px] overflow-hidden rounded-b-lg">
          <Map 
            locations={[
              {
                lat: latitude,
                lng: longitude,
                title: title
              }
            ]} 
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function IncidentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const incidentId = params.id as string; 

  const [incidentData, setIncidentData] = useState<Incident | null>(null);
  const [incidentTypes, setIncidentTypes] = useState<Array<{id: number, name: string}>>([]);
  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const [office, setOffice] = useState<Office | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumen');
  const [error, setError] = useState<string | null>(null);

  // Fetch incident data from the API
  useEffect(() => {
    async function fetchIncidentData() {
      try {
        setLoading(true);
        // Fetch incident data
        const incident = await getIncidentById(incidentId);
        console.log('Incident data:', incident);
        setIncidentData(incident);
        
        // Fetch specific office data if available
        if (incident.Office) {
          const officeData = await getOffice(incident.Office);
          if (officeData) setOffice(officeData);
        }
        
        // Fetch suspects if available
        const suspectIds = incident.Suspects || [];
        if (suspectIds.length > 0) {
          const suspectPromises = suspectIds.map((suspectId: string) => 
            getSuspectById(suspectId).catch(err => {
              console.error(`Error fetching suspect ${suspectId}:`, err);
              return null;
            })
          );
          
          const suspectResults = await Promise.all(suspectPromises);
          // Filter out null values and ensure type safety
          const filteredSuspects = suspectResults.filter((suspect): suspect is Suspect => suspect !== null);
          setSuspects(filteredSuspects);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching incident:', err);
        setError('Error al cargar los datos del incidente');
        setLoading(false);
      }
    }
    
    if (incidentId) {
      fetchIncidentData();
    }

    // Fetch all incident types
    const fetchIncidentTypes = async () => {
      try {
        const response = await getIncidentTypes();
        setIncidentTypes(response.results);
      } catch (error) {
        console.error('Error fetching incident types:', error);
      }
    };

    fetchIncidentTypes();
  }, [incidentId]);

  // Función para volver a la lista de incidentes
  const handleBack = () => {
    router.push('/dashboard/incidentes');
  };

  // Si está cargando, mostrar un indicador de carga
  if (loading) {
    return (
      <div className="container py-6 space-y-6">
        <Button onClick={handleBack} variant="outline" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la lista
        </Button>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-muted-foreground">Cargando detalles del incidente...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si hay un error, mostrar mensaje de error
  if (error) {
    return (
      <div className="container py-6 space-y-6">
        <Button onClick={handleBack} variant="outline" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la lista
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center h-[40vh] text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleBack} variant="default">
                Volver a la lista de incidentes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si no hay datos, mostrar un mensaje de error
  if (!incidentData) {
    return (
      <div className="container py-6 space-y-6">
        <Button onClick={handleBack} variant="outline" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la lista
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center h-[40vh] text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Incidente no encontrado</h2>
              <p className="text-muted-foreground mb-4">No se pudo encontrar el incidente con ID: {incidentId}</p>
              <Button onClick={handleBack} variant="default">
                Volver a la lista de incidentes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Format date and time using parseISO for proper date handling
  const incidentDate = incidentData.Date || incidentData.date;
  const formattedDate = incidentDate 
    ? format(parseISO(incidentDate as string), "PPP", { locale: es }) 
    : 'Fecha no disponible';
  
  const incidentTime = incidentData.Time || incidentData.time;
  const formattedTime = incidentTime 
    ? format(parseISO(`2000-01-01T${incidentTime as string}`), "HH:mm", { locale: es }) 
    : 'Hora no disponible';
  
  const formattedDateTime = `${formattedDate} a las ${formattedTime}`;
  
  // Get office name
  const officeName = office ? office.Name : getOfficeName(incidentData.Office || incidentData.officeId);
  
  // Check if incident has suspects
  const suspectIds = incidentData?.Suspects || [];
  const hasSuspects = suspects.length > 0 || suspectIds.length > 0;
  
  // Check if incident has attachments
  const attachments = incidentData?.Attachments || [];
  const hasAttachments = attachments.length > 0;
  
  // Get incident type name
  const incidentTypeId = incidentData?.IncidentType || incidentData?.incidentTypeId;
  const incidentTypeName = getIncidentTypeName(incidentTypeId, incidentTypes);

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
              <Badge variant={incidentTypeName.toLowerCase() === 'hurto' || incidentTypeName.toLowerCase() === 'robo' ? 'destructive' : 'secondary'}>
                {incidentTypeName}
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
                        <p className="text-sm font-medium">Oficina</p>
                        <p className="text-muted-foreground">{officeName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Fecha</p>
                        <p className="text-muted-foreground">{formattedDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Hora</p>
                        <p className="text-muted-foreground">{formattedTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Tipo de Incidente</p>
                        <Badge variant={incidentTypeName.toLowerCase() === 'hurto' || incidentTypeName.toLowerCase() === 'robo' ? 'destructive' : 'secondary'}>
                          {incidentTypeName}
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
              {/* Pérdidas Financieras */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><DollarSign className="h-5 w-5"/> Pérdidas Financieras</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Total</span>
                    </div>
                    <span className="text-lg font-bold">{getTotalLoss(incidentData)}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 border rounded-md">
                      <p className="text-sm text-muted-foreground mb-1">Efectivo</p>
                      <p className="font-medium">{formatCurrency(incidentData.CashLoss || incidentData.cashLoss)}</p>
                    </div>
                    <div className="p-3 border rounded-md">
                      <p className="text-sm text-muted-foreground mb-1">Mercadería</p>
                      <p className="font-medium">{formatCurrency(incidentData.MerchandiseLoss || incidentData.merchandiseLoss)}</p>
                    </div>
                    <div className="p-3 border rounded-md">
                      <p className="text-sm text-muted-foreground mb-1">Otros</p>
                      <p className="font-medium">{formatCurrency(incidentData.OtherLosses || incidentData.otherLosses)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mapa de Ubicación */}
              <IncidentLocationMap 
                latitude={incidentData.latitude} 
                longitude={incidentData.longitude} 
                title={`Incidente ${incidentData.id} - ${incidentTypeName}`} 
              />
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
                      <dd className="text-sm text-muted-foreground">{getIncidentTypeName(incidentData.IncidentType, incidentTypes)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium">Oficina</dt>
                      <dd className="text-sm text-muted-foreground">{officeName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium">Dirección</dt>
                      <dd className="text-sm text-muted-foreground">{office?.Address || incidentData?.Address || "No disponible"}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Detalles de Pérdidas</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium">Pérdida Total</dt>
                      <dd className="text-sm text-muted-foreground">{getTotalLoss(incidentData)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium">Efectivo</dt>
                      <dd className="text-sm text-muted-foreground">{formatCurrency(incidentData.CashLoss || incidentData.cashLoss)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium">Mercadería</dt>
                      <dd className="text-sm text-muted-foreground">{formatCurrency(incidentData.MerchandiseLoss || incidentData.merchandiseLoss)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium">Otras Pérdidas</dt>
                      <dd className="text-sm text-muted-foreground">{formatCurrency(incidentData.OtherLosses || incidentData.otherLosses)}</dd>
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
                  {suspects.map((suspect) => (
                    <Card key={suspect.id} className="overflow-hidden">
                      <div className="flex items-start gap-4 p-4">
                        <div className="w-16 h-16 rounded-full bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {suspect.PhotoUrl ? (
                            <Image src={suspect.PhotoUrl} alt={suspect.Alias} width={64} height={64} className="object-cover" />
                          ) : (
                            <Users className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{suspect.Alias}</h3>
                              <Badge variant={suspect.Status === 1 ? 'default' : 'outline'} className="mt-1">
                                {suspect.Status === 1 ? 'Detenido' : 'Libre'}
                              </Badge>
                            </div>
                          </div>
                          {suspect.PhysicalDescription && (
                            <p className="text-sm text-muted-foreground mt-2">{suspect.PhysicalDescription}</p>
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
                  {incidentData.Attachments?.map((file, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="flex items-center gap-4 p-4">
                        <div className="w-12 h-12 rounded bg-muted flex-shrink-0 flex items-center justify-center">
                          <FileImage className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium text-sm truncate" title={file.name}>{file.name}</h3>
                          <p className="text-xs text-muted-foreground">Archivo adjunto</p>
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
      {incidentData && (
        <div className="mt-12">
          <Separator />
          <h2 className="text-xl md:text-2xl font-semibold mt-8 mb-6 text-center">Visualización de la Denuncia Policial</h2>
          <PoliceReportPreview 
            incidentData={incidentData} 
            suspects={suspects}
            incidentTypes={incidentTypes}
          />
        </div>
      )}
    </div>
  );
} 