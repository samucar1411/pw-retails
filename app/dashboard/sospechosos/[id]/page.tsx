'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import jsPDF from 'jspdf';
import { Download, Edit, User } from 'lucide-react';
import { useEffect, useState, use } from 'react';
import { getOffice } from '@/services/office-service';
import { getIncidentTypeWithCache } from '@/services/incident-type-service';
import { getCompanyById } from '@/services/company-service';
import { Office } from '@/types/office';
import { Company } from '@/types/company';
import { IncidentType as IncidentTypeDetails } from '@/types/incident';
import UIMap from '@/components/ui/map';
import { getSuspect } from '@/services/suspect-service';
import { Suspect } from '@/types/suspect';
import { api } from '@/services/api';
import { getSafeImageUrl } from '@/lib/utils';
import Link from 'next/link';

interface SuspectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SuspectDetailPage(props: SuspectDetailPageProps) {
  const params = use(props.params);
  const { id } = params;
  const suspectId = id;

  const [suspect, setSuspect] = useState<Suspect | null>(null);
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [incidentsLoading, setIncidentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [officeDetails, setOfficeDetails] = useState<Map<number, Office>>(new Map());
  // Define map location type compatible with ui/map component
  type MapLocation = {
    id: string | number;
    lat: number;
    lng: number;
    title: string;
    description: string;
    address?: string;
    logoUrl?: string;
    officeId?: string | number;
    popupContent?: string;
    incidentData?: {
      id: string;
      date: string;
      time: string;
      incidentType?: string;
      totalLoss?: string;
      suspectCount?: number;
      status?: string;
      severity?: 'low' | 'medium' | 'high';
    };
  };

  const [mapLocations, setMapLocations] = useState<MapLocation[]>([]);
  const [incidentTypeNames, setIncidentTypeNames] = useState<Map<number, string>>(new Map());
  const [relatedSuspects, setRelatedSuspects] = useState<Suspect[]>([]);
  const [relatedSuspectsLoading, setRelatedSuspectsLoading] = useState(true);

  // Define the Incident type
  type Incident = {
    id: string;
    Date: string;
    Description: string;
    TotalLoss: string;
    Time?: string;
    CashLoss?: string;
    MerchandiseLoss?: string;
    OtherLosses?: string;
    Notes?: string;
    Office?: number;
    IncidentType?: number;
    Suspects?: string[]; // Added based on types/incident.ts
  };

  useEffect(() => {
    async function loadSuspectAndIncidents() {
      setLoading(true);
      setIncidentsLoading(true);
      try {
        const data = await getSuspect(suspectId);
        if (!data) {
          setError('No se pudo encontrar el sospechoso');
          setLoading(false);
          setIncidentsLoading(false);
          return;
        }
        setSuspect(data);
        setLoading(false);

        // Load incidents
        if (data.Alias) {
          let fetchedIncidents: Incident[] = [];
          
          try {
            // Use the centralized API configuration instead of direct fetch
            const { data: incidentData } = await api.get('/api/incidents/', {
              params: { suspect_alias: data.Alias }
            });
            fetchedIncidents = incidentData.results || [];
            setIncidents(fetchedIncidents);
            setIncidentsLoading(false);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
            setIncidentsLoading(false);
            throw new Error('Failed to fetch incidents');
          }

          // After incidents are loaded, fetch additional details
          if (fetchedIncidents.length > 0) {
            // Fetch Incident Type Details
            const incidentTypeIds = [...new Set(fetchedIncidents.map(inc => inc.IncidentType).filter(id => id !== undefined))] as number[];
            const typePromises = incidentTypeIds.map(id => getIncidentTypeWithCache(id));
            const fetchedTypes = (await Promise.all(typePromises)).filter(Boolean) as IncidentTypeDetails[];
            
            const newIncidentTypeNames = new Map<number, string>();
            fetchedTypes.forEach(type => {
              if (type && type.id) newIncidentTypeNames.set(type.id, type.Name || `Tipo ${type.id}`);
            });
            setIncidentTypeNames(newIncidentTypeNames);
            
            // Fetch Office Details for Map
            const officeIds = [...new Set(fetchedIncidents.map(inc => inc.Office).filter(id => id !== undefined))] as number[];
            const officePromises = officeIds.map(id => getOffice(id));
            const fetchedOffices = (await Promise.all(officePromises)).filter(Boolean) as Office[];
            
            const newOfficeDetails = new Map<number, Office>();
            const newMapLocations: MapLocation[] = [];

            // Fetch company details for logos
            const companyIds = [...new Set(fetchedOffices.map(office => office.Company))];
            const companyPromises = companyIds.map(id => getCompanyById(id.toString()));
            const fetchedCompanies = (await Promise.all(companyPromises)).filter(Boolean) as Company[];
            
            const newCompanyDetails = new Map<number, Company>();
            fetchedCompanies.forEach(company => {
              if (company && company.id) {
                newCompanyDetails.set(parseInt(company.id), company);
              }
            });
            
            fetchedOffices.forEach(office => {
              if (office && office.id) newOfficeDetails.set(office.id, office);
              if (office && office.Geo) {
                const [latStr, lngStr] = office.Geo.split(',');
                const lat = parseFloat(latStr);
                const lng = parseFloat(lngStr);
                if (!isNaN(lat) && !isNaN(lng)) {
                  // Get company logo if available
                  const company = newCompanyDetails.get(office.Company);
                  const logoUrl = company?.image_url ? getSafeImageUrl(company.image_url) : '';
                  
                  // Encontrar incidentes relacionados con esta oficina
                  const officeIncidents = fetchedIncidents.filter(inc => inc.Office === office.id);
                  const latestIncident = officeIncidents.sort((a, b) => 
                    new Date(b.Date).getTime() - new Date(a.Date).getTime()
                  )[0];

                  newMapLocations.push({
                    id: office.id,
                    lat,
                    lng,
                    title: office.Name || office.Address || `Oficina ${office.id}`,
                    description: office.Address || 'Dirección no disponible',
                    address: office.Address,
                    logoUrl: logoUrl || undefined,
                    officeId: office.id,
                    incidentData: latestIncident ? {
                      id: latestIncident.id,
                      date: latestIncident.Date,
                      time: latestIncident.Time || '',
                      incidentType: newIncidentTypeNames.get(latestIncident.IncidentType || 0) || 'Tipo desconocido',
                      totalLoss: latestIncident.TotalLoss || '0',
                      suspectCount: latestIncident.Suspects?.length || 0,
                      status: 'Reportado',
                      severity: (() => {
                        const totalLoss = parseFloat(latestIncident.TotalLoss || '0');
                        if (totalLoss > 1000000) return 'high' as const;
                        if (totalLoss > 100000) return 'medium' as const;
                        return 'low' as const;
                      })()
                    } : undefined
                  });
                }
              }
            });
            setOfficeDetails(newOfficeDetails);
            setMapLocations(newMapLocations);
            
            // Después de cargar los incidentes, buscar sospechosos relacionados
            if (fetchedIncidents.length > 0) {
              try {
                // Obtener IDs únicos de sospechosos relacionados de los incidentes
                const relatedSuspectIds = [...new Set(
                  fetchedIncidents
                    .flatMap(inc => inc.Suspects || [])
                    .filter(id => id !== suspectId)
                )];

                if (relatedSuspectIds.length > 0) {
                  // Obtener detalles de cada sospechoso relacionado
                  const suspectPromises = relatedSuspectIds.map(id => getSuspect(id));
                  const fetchedSuspects = (await Promise.all(suspectPromises))
                    .filter(Boolean) as Suspect[];
                  setRelatedSuspects(fetchedSuspects);
                }
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
                // Failed to load related suspects
              }
              setRelatedSuspectsLoading(false);
            }

          } else {
            setIncidentsLoading(false);
          }
        } else {
          setIncidentsLoading(false);
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
        setError('Error al cargar los detalles del sospechoso');
        setLoading(false);
        setIncidentsLoading(false);
      }
    }
    
    loadSuspectAndIncidents();
  }, [suspectId]);
  
  // Helper to group incidents by type for display
  function getGroupedIncidents() {
    const grouped: Record<string, number> = {};
    incidents.forEach(incident => {
      if (incident.IncidentType && incidentTypeNames.has(incident.IncidentType)) {
        const typeName = incidentTypeNames.get(incident.IncidentType) || 'Desconocido';
        grouped[typeName] = (grouped[typeName] || 0) + 1;
      }
    });
    return grouped;
  }

  const groupedIncidents = getGroupedIncidents();

  // Generate PDF function for suspect profile
  const generateSuspectPDF = async () => {
    if (!suspect) return;
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.width;
      
      // Header with better styling (no logo at top)
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EXPEDIENTE DE SOSPECHOSO', 105, 25, { align: 'center' });
      
      // Subtitle
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Perfil detallado de sospechoso registrado', 105, 32, { align: 'center' });
      
      // Header line
      pdf.setDrawColor(50, 50, 50);
      pdf.setLineWidth(0.5);
      pdf.line(20, 40, pageWidth - 20, 40);
      
      // Reset text color
      pdf.setTextColor(0, 0, 0);
      
      // Document info box with better layout - now with space for image
      pdf.setFillColor(248, 249, 250);
      pdf.rect(20, 45, pageWidth - 40, 50, 'F'); // Increased height for image
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(20, 45, pageWidth - 40, 50, 'S');
      
      // Add suspect image if available
      if (suspect.PhotoUrl && suspect.PhotoUrl.trim() !== '') {
        try {
          // Load and add the suspect image
          const imageResponse = await fetch(suspect.PhotoUrl);
          const imageBlob = await imageResponse.blob();
          const imageBase64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(imageBlob);
          });
          
          // Add image to the right side of the info box
          pdf.addImage(imageBase64, 'JPEG', 140, 47, 35, 45);
          
          // Add image border
          pdf.setDrawColor(150, 150, 150);
          pdf.setLineWidth(0.5);
          pdf.rect(140, 47, 35, 45, 'S');
          
          // Add "Foto del Sospechoso" label
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(100, 100, 100);
          pdf.text('FOTO DEL SOSPECHOSO', 140, 95, { align: 'center' });
          
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
          // If image fails to load, add a placeholder
          pdf.setFillColor(240, 240, 240);
          pdf.rect(140, 47, 35, 45, 'F');
          pdf.setDrawColor(200, 200, 200);
          pdf.rect(140, 47, 35, 45, 'S');
          
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(150, 150, 150);
          pdf.text('Sin foto', 157.5, 69.5, { align: 'center' });
        }
      } else {
        // Placeholder when no image
        pdf.setFillColor(240, 240, 240);
        pdf.rect(140, 47, 35, 45, 'F');
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(140, 47, 35, 45, 'S');
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(150, 150, 150);
        pdf.text('Sin foto', 157.5, 69.5, { align: 'center' });
      }
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      
      // ID del sospechoso en su propia línea con más espacio
      pdf.text(`ID del Sospechoso:`, 25, 53);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(`${suspect.id}`, 25, 58);
      
      // Información en columnas separadas
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Alias: `, 25, 65);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${suspect.Alias || 'Sin alias'}`, 45, 65);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Estado: `, 25, 72);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${suspect.Status === 1 ? 'ACTIVO' : 'INACTIVO'}`, 45, 72);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Incidentes: `, 25, 79);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${incidents.length} registrado${incidents.length !== 1 ? 's' : ''}`, 55, 79);
      
      // Información personal adicional
      if (suspect.CI || suspect.Name || suspect.LastName) {
        pdf.setFont('helvetica', 'bold');
        pdf.text(`CI: `, 25, 86);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${suspect.CI || 'No registrado'}`, 40, 86);
        
        if (suspect.Name || suspect.LastName) {
          const nombreCompleto = `${suspect.Name || ''} ${suspect.LastName || ''}`.trim();
          if (nombreCompleto) {
            pdf.setFont('helvetica', 'bold');
            pdf.text(`Nombre: `, 25, 93);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`${nombreCompleto}`, 55, 93);
          }
        }
      }
      
      // Suspect details section
      let yPos = 105; // Moved down to accommodate the larger info box with image
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(50, 50, 50);
      pdf.text('INFORMACIÓN DEL SOSPECHOSO', 20, yPos);
      
      // Section underline
      pdf.setDrawColor(100, 100, 100);
      pdf.setLineWidth(0.3);
      pdf.line(20, yPos + 2, 140, yPos + 2);
      
      yPos += 12;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      // Physical description
      if (suspect.PhysicalDescription) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Descripción Física:', 20, yPos);
        yPos += 7;
        
        pdf.setFont('helvetica', 'normal');
        const description = suspect.PhysicalDescription || 'Sin descripción';
        const splitDescription = pdf.splitTextToSize(description, 170);
        pdf.text(splitDescription, 20, yPos);
        yPos += splitDescription.length * 5 + 10;
      }
      
      // Tags information if available
      if (suspect.Tags && Object.keys(suspect.Tags).length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Características Físicas:', 20, yPos);
        yPos += 7;
        
        pdf.setFont('helvetica', 'normal');
        const tagsText = Object.entries(suspect.Tags)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        const splitTags = pdf.splitTextToSize(tagsText, 170);
        pdf.text(splitTags, 20, yPos);
        yPos += splitTags.length * 5 + 10;
      }
      
      // Incidents section
      if (incidents.length > 0) {
        yPos += 8;
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(50, 50, 50);
        pdf.text('INCIDENTES RELACIONADOS', 20, yPos);
        
        // Section underline
        pdf.setDrawColor(100, 100, 100);
        pdf.setLineWidth(0.3);
        pdf.line(20, yPos + 2, 125, yPos + 2);
        
        yPos += 12;
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        
        // Incident types summary
        if (Object.keys(groupedIncidents).length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Resumen por tipo de incidente:', 20, yPos);
          yPos += 7;
          
          pdf.setFont('helvetica', 'normal');
          Object.entries(groupedIncidents).forEach(([typeName, count]) => {
            pdf.text(`• ${typeName}: ${count} incidente${count !== 1 ? 's' : ''}`, 25, yPos);
            yPos += 5;
          });
          yPos += 5;
        }
        
        // Recent incidents list (last 5)
        const recentIncidents = incidents.slice(0, 5);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Incidentes recientes:', 20, yPos);
        yPos += 7;
        
        pdf.setFont('helvetica', 'normal');
        recentIncidents.forEach((incident, index) => {
          const incidentTypeName = incident.IncidentType && incidentTypeNames.has(incident.IncidentType) 
            ? incidentTypeNames.get(incident.IncidentType) 
            : 'Tipo desconocido';
          
          const dateStr = incident.Date ? format(new Date(incident.Date), 'dd/MM/yyyy', { locale: es }) : 'Sin fecha';
          
          pdf.text(`${index + 1}. ${incidentTypeName} - ${dateStr}`, 25, yPos);
          yPos += 4;
          
          if (incident.Description) {
            const shortDesc = incident.Description.length > 80 
              ? incident.Description.substring(0, 80) + '...' 
              : incident.Description;
            const splitDesc = pdf.splitTextToSize(`   ${shortDesc}`, 165);
            pdf.text(splitDesc, 25, yPos);
            yPos += splitDesc.length * 4 + 2;
          }
          yPos += 2;
        });
      }
      
      // Professional footer with logo reference
      const pageHeight = pdf.internal.pageSize.height;
      
      // Footer line
      pdf.setDrawColor(100, 100, 100);
      pdf.setLineWidth(0.3);
      pdf.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Documento generado automáticamente por', 105, pageHeight - 18, { align: 'center' });
      
      // Add logo in footer (larger size)
      try {
        const logoResponse = await fetch('/logo-light.png');
        const logoBlob = await logoResponse.blob();
        const logoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(logoBlob);
        });
        
        // Larger logo in footer
        pdf.addImage(logoBase64, 'PNG', 85, pageHeight - 20, 40, 15);
      } catch {
        pdf.text('PW Retails', 105, pageHeight - 13, { align: 'center' });
      }
      
      pdf.setFontSize(9);
      pdf.text(`Generado el: ${new Date().toLocaleDateString('es-PY')} a las ${new Date().toLocaleTimeString('es-PY')}`, 105, pageHeight - 5, { align: 'center' });
      
      pdf.save(`Expediente-${suspect.Alias || suspectId}.pdf`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
      // Error generating PDF
    }
  };

  if (loading || !suspect) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!suspect) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="bg-accent/10 border border-accent/20 text-accent-foreground px-4 py-3 rounded">
          <p>No se encontró información del sospechoso.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/sospechosos">Sospechosos</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{suspect.Alias || 'Detalle de sospechoso'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              {/* Foto y estado */}
              <div className="flex flex-col items-center space-y-3">
                <div className="relative w-40 h-40 overflow-hidden border-4 border-muted">
                  {suspect.PhotoUrl ? (
                    <Image
                      src={getSafeImageUrl(suspect.PhotoUrl)}
                      alt={suspect.Alias || 'Sospechoso'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <User className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <Badge variant={suspect.Status === 1 ? "destructive" : "secondary"} className="text-sm">
                  {suspect.Status === 1 ? "Detenido" : "Libre"}
                </Badge>
              </div>

              {/* Información principal */}
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold">{suspect.Alias}</h1>
                    <p className="text-muted-foreground">ID: {suspect.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={generateSuspectPDF}>
                      <Download className="w-4 h-4 mr-2" />
                      Exportar PDF
                    </Button>
                    <Button asChild>
                      <Link href={`/dashboard/sospechosos/${suspect.id}/edit`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{incidents.length}</div>
                      <p className="text-sm text-muted-foreground">Incidentes totales</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {incidents.reduce((sum, inc) => {
                          const total = parseFloat(inc.TotalLoss || '0');
                          return sum + (isNaN(total) ? 0 : total);
                        }, 0).toLocaleString('es-PY', { style: 'currency', currency: 'PYG' })}
                      </div>
                      <p className="text-sm text-muted-foreground">Pérdidas totales</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {mapLocations.length}
                      </div>
                      <p className="text-sm text-muted-foreground">Sucursales afectadas</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Características */}
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-normal text-muted-foreground mb-2">Nombre</h3>
                  <p className="text-foreground font-semibold">
                    {suspect.Name || 'Sin información'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-normal text-muted-foreground mb-2">Apellido</h3>
                  <p className="text-foreground font-semibold">
                    {suspect.LastName || 'Sin información'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-normal text-muted-foreground mb-2">CI</h3>
                  <p className="text-foreground font-semibold">
                    {suspect.CI || 'Sin información'}
                  </p>
                </div>
              </div>

              {/* Descripción física */}
              <div>
                <h3 className="font-normal text-muted-foreground mb-2">Descripción física</h3>
                <p className="text-foreground font-semibold">
                  {suspect.PhysicalDescription || 'Sin información'}
                </p>
              </div>

              {/* Tags/Características */}
              <div>
                <h3 className="font-medium mb-4">Características distintivas</h3>
                <div className="bg-card border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Género */}
                    <div>
                      <h4 className="text-sm font-normal text-muted-foreground mb-1">Género</h4>
                      <p className="text-sm text-foreground font-semibold">
                        {suspect.Tags?.sexo ? 
                          (suspect.Tags.sexo === 'masculino' ? 'Hombre' : 
                           suspect.Tags.sexo === 'femenino' ? 'Mujer' : 
                           suspect.Tags.sexo === 'desconocido' ? 'Desconocido' : suspect.Tags.sexo)
                          : 'Sin información'
                        }
                      </p>
                    </div>
                    
                    {/* Contextura */}
                    <div>
                      <h4 className="text-sm font-normal text-muted-foreground mb-1">Contextura</h4>
                      <p className="text-sm text-foreground font-semibold">
                        {suspect.Tags?.contextura ? 
                          suspect.Tags.contextura.charAt(0).toUpperCase() + suspect.Tags.contextura.slice(1).toLowerCase()
                          : 'Sin información'
                        }
                      </p>
                    </div>
                    
                    {/* Estatura */}
                    <div>
                      <h4 className="text-sm font-normal text-muted-foreground mb-1">Estatura</h4>
                      <p className="text-sm text-foreground font-semibold">
                        {suspect.Tags?.altura ? 
                          (() => {
                            switch(suspect.Tags.altura) {
                              case 'bajo': return 'Bajo (<1.60m)';
                              case 'normal': return 'Normal (1.60m-1.75m)';
                              case 'alto': return 'Alto (1.76m-1.85m)';
                              case 'muy_alto': return 'Muy Alto (>1.85m)';
                              default: return suspect.Tags.altura;
                            }
                          })()
                          : 'Sin información'
                        }
                      </p>
                    </div>
                    
                    {/* Tono de piel */}
                    <div>
                      <h4 className="text-sm font-normal text-muted-foreground mb-1">Tono de piel</h4>
                      <p className="text-sm text-foreground font-semibold">
                        {suspect.Tags?.piel ? 
                          suspect.Tags.piel.charAt(0).toUpperCase() + suspect.Tags.piel.slice(1).toLowerCase()
                          : 'Sin información'
                        }
                      </p>
                    </div>
                    
                    {/* Piercings */}
                    <div>
                      <h4 className="text-sm font-normal text-muted-foreground mb-1">Piercings</h4>
                      <p className="text-sm text-foreground font-semibold">
                        {suspect.Tags?.piercings ? 
                          suspect.Tags.piercings.split(',').map(p => p.trim().charAt(0).toUpperCase() + p.trim().slice(1).toLowerCase()).join(', ')
                          : 'Sin información'
                        }
                      </p>
                    </div>
                    
                    {/* Tatuajes */}
                    <div>
                      <h4 className="text-sm font-normal text-muted-foreground mb-1">Tatuajes</h4>
                      <p className="text-sm text-foreground font-semibold">
                        {suspect.Tags?.tatuajes ? 
                          suspect.Tags.tatuajes.split(',').map(t => t.trim().charAt(0).toUpperCase() + t.trim().slice(1).toLowerCase()).join(', ')
                          : 'Sin información'
                        }
                      </p>
                    </div>
                    
                    {/* Accesorios */}
                    <div>
                      <h4 className="text-sm font-normal text-muted-foreground mb-1">Accesorios</h4>
                      <p className="text-sm text-foreground font-semibold">
                        {suspect.Tags?.accesorios ? 
                          suspect.Tags.accesorios.split(',').map(a => a.trim().charAt(0).toUpperCase() + a.trim().slice(1).toLowerCase().replace('_', ' ')).join(', ')
                          : 'Sin información'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comportamiento - Nueva sección separada */}
              <div>
                <h3 className="font-medium mb-4">Comportamiento</h3>
                <div className="bg-card border rounded-lg p-4">
                  <div className="flex flex-wrap gap-2">
                    {suspect.Tags?.comportamiento ? (
                      suspect.Tags.comportamiento.split(',').map(behavior => {
                        const behaviorLabels: Record<string, string> = {
                          'nervioso': 'Nervioso',
                          'agresivo': 'Agresivo',
                          'portaba_armas': 'Portaba Armas',
                          'abuso_fisico': 'Abuso Físico',
                          'alcohol_droga': 'Alcoholizado/Drogado'
                        };
                        const trimmedBehavior = behavior.trim().toLowerCase();
                        return (
                          <Badge key={trimmedBehavior} variant="destructive" className="text-xs">
                            {behaviorLabels[trimmedBehavior] || trimmedBehavior}
                          </Badge>
                        );
                      })
                    ) : (
                      <span className="text-sm text-muted-foreground">Sin información</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Elementos que dificultan identificación */}
              <div>
                <h3 className="font-medium mb-4">Elementos que dificultan identificación</h3>
                <div className="bg-card border rounded-lg p-4">
                  <div className="flex flex-wrap gap-2">
                    {suspect.Tags?.dificulta_identificacion ? (
                      suspect.Tags.dificulta_identificacion.split(',').map(difficultyItem => {
                        const elementLabels: Record<string, string> = {
                          'mascarilla': 'Mascarilla',
                          'casco': 'Casco',
                          'pasamontanas': 'Pasamontañas',
                          'capucha': 'Capucha',
                          'lentes_oscuros': 'Lentes Oscuros'
                        };
                        const trimmedDifficultyItem = difficultyItem.trim().toLowerCase();
                        return (
                          <Badge key={trimmedDifficultyItem} variant="secondary" className="text-xs">
                            {elementLabels[trimmedDifficultyItem] || trimmedDifficultyItem}
                          </Badge>
                        );
                      })
                    ) : (
                      <span className="text-sm text-muted-foreground">Sin información</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Última vez visto */}
              {suspect.LastSeen && (
                <div>
                  <h3 className="font-normal text-muted-foreground mb-2">Última vez visto</h3>
                  <p className="text-foreground font-semibold">
                    {format(new Date(suspect.LastSeen), "d 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sospechosos relacionados */}
        <Card>
          <CardHeader>
            <CardTitle>Sospechosos relacionados</CardTitle>
            <p className="text-sm text-muted-foreground">
              Otros sospechosos involucrados en los mismos incidentes
            </p>
          </CardHeader>
          <CardContent>
            {relatedSuspectsLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : relatedSuspects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedSuspects.map((rs) => (
                  <Link 
                    key={rs.id} 
                    href={`/dashboard/sospechosos/${rs.id}`}
                    className="group"
                  >
                    <Card className="hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 overflow-hidden border-2 border-muted">
                            {rs.PhotoUrl ? (
                              <Image
                                src={getSafeImageUrl(rs.PhotoUrl)}
                                alt={rs.Alias || 'Sospechoso'}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <User className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium group-hover:text-primary transition-colors">
                              {rs.Alias}
                            </p>
                            <Badge 
                              variant={rs.Status === 1 ? "destructive" : "secondary"}
                              className="mt-1 text-xs"
                            >
                              {rs.Status === 1 ? "Detenido" : "Libre"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron sospechosos relacionados
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grid para mapa e historial */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mapa de incidentes */}
          {mapLocations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Ubicaciones de incidentes</CardTitle>
              </CardHeader>
              <CardContent className="p-0" style={{ height: '500px' }}>
                <div className="w-full h-full">
                  <UIMap locations={mapLocations} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de incidentes */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Historial de incidentes</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {incidents.length} incidente{incidents.length !== 1 ? 's' : ''} registrado{incidents.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center bg-red-500 gap-4">
                  {/* Resumen de pérdidas */}
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Pérdidas totales</p>
                    <p className="text-lg font-semibold">
                      {incidents.reduce((sum, inc) => {
                        const total = parseFloat(inc.TotalLoss || '0');
                        return sum + (isNaN(total) ? 0 : total);
                      }, 0).toLocaleString('es-PY', { style: 'currency', currency: 'PYG' })}
                    </p>
                  </div>
                  {/* Resumen de tipos de incidentes */}
                  <div className="border-l pl-4">
                    <p className="text-sm text-muted-foreground">Tipos más comunes</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(groupedIncidents)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 2)
                        .map(([type, count]) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type}: {count}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[500px] overflow-auto">
              {incidentsLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : incidents.length > 0 ? (
                <div className="space-y-6">
                  {incidents.map((incident) => {
                    const office = incident.Office ? officeDetails.get(incident.Office) : null;
                    const incidentType = incident.IncidentType ? incidentTypeNames.get(incident.IncidentType) : 'Desconocido';
                    
                    return (
                      <Link key={incident.id} href={`/dashboard/incidentes/${incident.id}`}>
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium hover:text-primary transition-colors">{incidentType}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(incident.Date), "d 'de' MMMM 'de' yyyy", { locale: es })}
                                  {incident.Time && ` - ${incident.Time}`}
                                </p>
                              </div>
                              <Badge variant="outline">
                                {parseFloat(incident.TotalLoss || '0').toLocaleString('es-PY', { 
                                  style: 'currency', 
                                  currency: 'PYG' 
                                })}
                              </Badge>
                            </div>
                            {office && (
                              <div className="text-sm text-muted-foreground mb-2">
                                {office.Name} - {office.Address}
                              </div>
                            )}
                            {incident.Description && (
                              <p className="text-sm mt-2">{incident.Description}</p>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron incidentes registrados
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
