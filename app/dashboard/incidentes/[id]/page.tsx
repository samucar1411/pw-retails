'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft, DollarSign, Users, MapPin, FileText, AlertTriangle,
  Calendar, Building, FileImage, Download, Printer, Share2, User
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Map from '@/components/ui/map';

// Services
import { getIncidentById } from '@/services/incident-service';
import { getIncidentTypeWithCache } from '@/services/incident-type-service';
import { getOffice } from '@/services/office-service';
import { getSuspectById } from '@/services/suspect-service';
import { getCompanyById } from '@/services/company-service';

// Types
import { Incident } from '@/types/incident';
import { Suspect } from '@/types/suspect';
import { Office } from '@/types/office';

interface IncidentDetailPageProps {
  params: {
    id: string;
  };
}

export default function IncidentDetailPage(props: IncidentDetailPageProps) {
  // Use the 'use' hook to unwrap the params object properly
  const { id } = use(props.params);
  const router = useRouter();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [incidentType, setIncidentType] = useState<string>('');
  const [office, setOffice] = useState<Office | null>(null);
  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const [suspectsLoading, setSuspectsLoading] = useState(true);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  
  // Fetch incident data
  useEffect(() => {
    const fetchIncidentData = async () => {
      try {
        setLoading(true);
        const data = await getIncidentById(id);
        setIncident(data);
        
        // Fetch incident type
        if (data.IncidentType) {
          const typeData = await getIncidentTypeWithCache(data.IncidentType);
          setIncidentType(typeData?.name || 'Tipo desconocido');
        }
        
        // Fetch office data
        if (data.Office) {
          const officeData = await getOffice(data.Office);
          setOffice(officeData);
          
          // Fetch company logo if office has company
          if (officeData?.Company) {
            const company = await getCompanyById(officeData.Company);
            setCompanyLogo(company?.LogoUrl || null);
          }
        }
        
        // Fetch suspects
        setSuspectsLoading(true);
        if (data.Suspects && data.Suspects.length > 0) {
          const suspectPromises = data.Suspects.map((suspectId: string) => 
            getSuspectById(suspectId)
          );
          const suspectData = await Promise.all(suspectPromises);
          setSuspects(suspectData.filter(Boolean));
        } else {
          // Create a placeholder suspect if none exists
          setSuspects([{
            id: 'unknown',
            Name: 'Sospechoso Desconocido',
            Status: 0,
            PhotoUrl: null
          } as Suspect]);
        }
        setSuspectsLoading(false);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching incident data:', error);
        setLoading(false);
      }
    };
    
    fetchIncidentData();
  }, [id]);
  
  const formatCurrency = (value: string | number | undefined | null): string => {
    if (value === undefined || value === null || value === '') return '$0';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '$0';
    return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(numValue);
  };
  
  const getTotalLoss = (): string => {
    if (!incident) return '$0';
    
    if (incident.TotalLoss) return formatCurrency(incident.TotalLoss);
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
  
  // Handle back button
  const handleBack = () => {
    router.back();
  };
  
  // Map location
  const mapLocations = office || (incident?.Latitude && incident?.Longitude) ? [
    {
      id: `incident-${incident?.id}`,
      lat: office?.Latitude || (incident?.Latitude || 0),
      lng: office?.Longitude || (incident?.Longitude || 0),
      title: office?.Name || 'PUNTO ' + (incident?.id || ''),
      address: office?.Address || incident?.Address || 'Dirección no disponible',
      logoUrl: companyLogo || undefined,
      officeId: office?.id,
      popupContent: `
        <div class="p-3">
          <div class="font-bold mb-1 text-primary">${office?.Name || 'PUNTO ' + (incident?.id || '')}</div>
          <div class="text-sm mb-2">${office?.Address || incident?.Address || 'Dirección no disponible'}</div>
          ${office?.Phone ? `<div class="text-xs text-muted-foreground">Tel: ${office.Phone}</div>` : ''}
          ${incident?.Date ? `<div class="text-xs mt-2 pt-2 border-t border-muted">Incidente ocurrido el ${format(new Date(incident.Date), 'dd/MM/yyyy', { locale: es })}</div>` : ''}
        </div>
      `
    }
  ] : [];
  
  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando información del incidente...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!incident) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Incidente no encontrado</h2>
          <p className="text-muted-foreground mb-6">No se pudo encontrar el incidente solicitado.</p>
          <Button onClick={handleBack}>Volver</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      {/* Header with back button and title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs px-2 py-0 bg-primary/10 text-primary">
                REPORTE DE INCIDENTE
              </Badge>
              <Badge variant="outline" className="text-xs px-2 py-0">
                ID: {incident.id}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold mt-1">
              {incidentType} - {incident.Date && format(new Date(incident.Date), 'dd/MM/yyyy', { locale: es })}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Compartir
          </Button>
        </div>
      </div>
      
      {/* Report Header Card */}
      <Card className="mb-6 bg-muted/20 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha y Hora</p>
                  <p className="font-medium">
                    {incident.Date && format(new Date(incident.Date), 'PPP', { locale: es })}
                    {incident.Time && ` - ${incident.Time.substring(0, 5)}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ubicación</p>
                  <p className="font-medium">{office?.Name || `Oficina ${incident.Office}`}</p>
                  {office?.Address && (
                    <p className="text-sm text-muted-foreground">{office.Address}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo de Incidente</p>
                  <p className="font-medium">{incidentType}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pérdida Total</p>
                  <p className="font-bold text-destructive">{getTotalLoss()}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sospechosos</p>
                  <p className="font-medium">{suspects.length} {suspects.length === 1 ? 'sospechoso' : 'sospechosos'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Main content grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
        {/* Row 1, Column 1: Incident Description */}
        <Card className="border border-muted h-full">
          <CardHeader className="bg-muted/30 border-b border-muted pb-3">
            <CardTitle className="flex items-center text-base">
              <FileText className="h-4 w-4 mr-2 text-primary" />
              Descripción del Incidente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-line">{incident.Description || 'Sin descripción'}</p>
              
              {incident.Notes && (
                <>
                  <Separator className="my-4" />
                  <h3 className="text-sm font-semibold mb-2">Notas Adicionales</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{incident.Notes}</p>
                </>
              )}
            </div>
            
            {/* Loss breakdown */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-semibold mb-3 flex items-center">
                <DollarSign className="h-4 w-4 mr-1 text-destructive" />
                Desglose de Pérdidas
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Efectivo</span>
                  <span>{formatCurrency(incident.CashLoss || incident.cashLoss || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mercadería</span>
                  <span>{formatCurrency(incident.MerchandiseLoss || incident.merchandiseLoss || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Otros</span>
                  <span>{formatCurrency(incident.OtherLosses || incident.otherLosses || 0)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span className="text-destructive">{getTotalLoss()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Row 1, Column 2: Map */}
        <Card className="h-full flex flex-col overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-muted pb-3">
            <CardTitle className="flex items-center text-base">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              Ubicación del Incidente
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 relative">
            {office || (incident.Latitude && incident.Longitude) ? (
              <div className="absolute inset-0">
                <Map locations={mapLocations} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[350px] bg-muted/20">
                <div className="text-center p-6">
                  <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No hay información de ubicación disponible</p>
                </div>
              </div>
            )}
          </CardContent>
          {office && (
            <div className="p-4 border-t border-muted bg-muted/10">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{office.Name}</p>
                  <p className="text-sm text-muted-foreground truncate">{office.Address}</p>
                </div>
                {office.Phone && (
                  <Badge variant="outline" className="whitespace-nowrap text-xs">
                    Tel: {office.Phone}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </Card>
        
        {/* Row 2, Column 1: Suspects */}
        <Card className="h-full">
          <CardHeader className="bg-muted/30 border-b border-muted pb-3">
            <CardTitle className="flex items-center text-base">
              <Users className="h-4 w-4 mr-2 text-primary" />
              Sospechosos Involucrados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {suspectsLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <ul className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
                {suspects.map(suspect => (
                  <li key={suspect.id}>
                    {suspect.id !== 'unknown' ? (
                      <Link 
                        href={`/dashboard/suspects/${suspect.id}`} 
                        className="flex items-center gap-3 border border-muted p-3 rounded-md hover:bg-muted/5 transition-colors no-underline"
                      >
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                          {suspect.PhotoUrl ? (
                            <Image 
                              src={suspect.PhotoUrl} 
                              alt={suspect.Name || 'Sospechoso'}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          ) : (
                            <User className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-primary">{suspect.Name || 'Sospechoso sin nombre'}</p>
                          {suspect.Alias && <p className="text-xs text-muted-foreground truncate">{suspect.Alias}</p>}
                          {suspect.PhysicalDescription && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{suspect.PhysicalDescription}</p>
                          )}
                        </div>
                        {suspect.Status !== undefined && (
                          <Badge variant={suspect.Status === 1 ? 'default' : 'outline'} className="whitespace-nowrap">
                            {suspect.Status === 1 ? 'Detenido' : 'Libre'}
                          </Badge>
                        )}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 border border-muted p-3 rounded-md bg-muted/5">
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                          <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">Sospechoso Desconocido</p>
                          <p className="text-xs text-muted-foreground">No hay información disponible</p>
                        </div>
                        <Badge variant="outline" className="whitespace-nowrap">
                          Desconocido
                        </Badge>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        
        {/* Row 2, Column 2: Attachments */}
        <Card className="h-full">
          <CardHeader className="bg-muted/30 border-b border-muted pb-3">
            <CardTitle className="flex items-center text-base">
              <FileImage className="h-4 w-4 mr-2 text-primary" />
              Archivos Adjuntos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {incident.Attachments && incident.Attachments.length > 0 ? (
              <ul className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
                {incident.Attachments.map((file, index) => (
                  <li key={index} className="flex items-center gap-3 border border-muted p-3 rounded-md">
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                      <FileImage className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">Archivo adjunto</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <FileImage className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No hay archivos adjuntos para este incidente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
