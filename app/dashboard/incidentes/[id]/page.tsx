'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import {
  ArrowLeft, DollarSign, Users, MapPin, FileText, AlertTriangle,
  Calendar, Building, FileImage, Download, Printer, User
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import Map from '@/components/ui/map';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

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
  params: Promise<{
    id: string;
  }>;
}

export default function IncidentDetailPage(props: IncidentDetailPageProps) {
  // Use the 'use' hook to unwrap the params Promise properly
  const { id } = use(props.params);
  const router = useRouter();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [incidentType, setIncidentType] = useState<string>('');
  const [office, setOffice] = useState<Office | null>(null);
  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const [suspectsLoading, setSuspectsLoading] = useState(true);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  
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
          setIncidentType(typeData?.Name || 'Tipo desconocido');
        }
        
        // Fetch office data
        if (data.Office) {
          const officeData = await getOffice(data.Office);
          setOffice(officeData);
          
          // Fetch company logo if office has company
          if (officeData?.Company) {
            const company = await getCompanyById(officeData.Company.toString());
            setCompanyLogo(company?.image_url || null);
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
            Alias: 'Sospechoso Desconocido',
            PhysicalDescription: 'No hay información disponible',
            PhotoUrl: '',
            Status: 0
          }]);
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
    if (value === undefined || value === null || value === '') return 'Gs. 0';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'Gs. 0';
    return 'Gs. ' + new Intl.NumberFormat('es-PY').format(numValue);
  };
  
  const getTotalLoss = (): string => {
    if (!incident) return 'Gs. 0';
    
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

  // Generate PDF function
  const generatePDF = async () => {
    if (!incident) return;
    setGeneratingPdf(true);
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.width;
      
      // Load and add logo
      try {
        const logoResponse = await fetch('/logo-light.png');
        const logoBlob = await logoResponse.blob();
        const logoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(logoBlob);
        });
        
        // Add logo (positioned top-left)
        pdf.addImage(logoBase64, 'PNG', 20, 15, 40, 15);
      } catch {
        console.warn('Could not load logo');
      }
      
      // Header with better styling
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('REPORTE DE INCIDENTE', 105, 25, { align: 'center' });
      
      // Subtitle
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Informe detallado de incidente registrado', 105, 32, { align: 'center' });
      
      // Header line
      pdf.setDrawColor(50, 50, 50);
      pdf.setLineWidth(0.5);
      pdf.line(20, 40, pageWidth - 20, 40);
      
      // Reset text color
      pdf.setTextColor(0, 0, 0);
      
      // Document info box
      pdf.setFillColor(248, 249, 250);
      pdf.rect(20, 45, pageWidth - 40, 25, 'F');
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(20, 45, pageWidth - 40, 25, 'S');
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`ID del Incidente: ${incident.id}`, 25, 53);
      pdf.text(`Fecha: ${incident.Date ? format(new Date(incident.Date), 'dd/MM/yyyy', { locale: es }) : 'No especificada'}`, 25, 60);
      pdf.text(`Hora: ${incident.Time ? incident.Time.substring(0, 5) : 'No especificada'}`, 120, 53);
      pdf.text(`Estado: REGISTRADO`, 120, 60);
      if (incidentType) {
        pdf.text(`Tipo: ${incidentType}`, 120, 67);
      }
      
      // Incident details section
      let yPos = 80;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(50, 50, 50);
      pdf.text('INFORMACIÓN DEL INCIDENTE', 20, yPos);
      
      // Section underline
      pdf.setDrawColor(100, 100, 100);
      pdf.setLineWidth(0.3);
      pdf.line(20, yPos + 2, 140, yPos + 2);
      
      yPos += 12;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      // Office information
      if (office) {
        pdf.text(`Sucursal: ${office.Name}`, 20, yPos);
        yPos += 5;
        pdf.text(`Dirección: ${office.Address || 'No especificada'}`, 20, yPos);
        yPos += 7;
      }
      
      // Incident type
      if (incidentType) {
        pdf.text(`Tipo de Incidente: ${incidentType}`, 20, yPos);
        yPos += 7;
      }
      
      // Time
      if (incident.Time) {
        pdf.text(`Hora: ${incident.Time.substring(0, 5)}`, 20, yPos);
        yPos += 7;
      }
      
      // Description
      yPos += 5;
      pdf.setFont('helvetica', 'bold');
      pdf.text('DESCRIPCIÓN DEL INCIDENTE:', 20, yPos);
      yPos += 7;
      
      pdf.setFont('helvetica', 'normal');
      const description = incident.Description || 'Sin descripción';
      const splitDescription = pdf.splitTextToSize(description, 170);
      pdf.text(splitDescription, 20, yPos);
      yPos += splitDescription.length * 5 + 10;
      
      // Losses breakdown section
      yPos += 8;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(50, 50, 50);
      pdf.text('DESGLOSE DE PÉRDIDAS', 20, yPos);
      
      // Section underline
      pdf.setDrawColor(100, 100, 100);
      pdf.setLineWidth(0.3);
      pdf.line(20, yPos + 2, 110, yPos + 2);
      
      yPos += 12;
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      
      // Losses table
      pdf.setFillColor(248, 249, 250);
      pdf.rect(20, yPos - 3, pageWidth - 40, 30, 'F');
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(20, yPos - 3, pageWidth - 40, 30, 'S');
      
      const cashLoss = formatCurrency(incident.CashLoss || incident.cashLoss || 0);
      const merchandiseLoss = formatCurrency(incident.MerchandiseLoss || incident.merchandiseLoss || 0);
      const otherLosses = formatCurrency(incident.OtherLosses || incident.otherLosses || 0);
      const totalLoss = getTotalLoss();
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Efectivo:', 25, yPos + 3);
      pdf.setFont('helvetica', 'normal');
      pdf.text(cashLoss, 120, yPos + 3);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Mercadería:', 25, yPos + 9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(merchandiseLoss, 120, yPos + 9);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Otros:', 25, yPos + 15);
      pdf.setFont('helvetica', 'normal');
      pdf.text(otherLosses, 120, yPos + 15);
      
      // Total - simple styling
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`PÉRDIDA TOTAL: ${totalLoss}`, 25, yPos + 21);
      
      yPos += 35;
      
      // Suspects
      if (suspects.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('SOSPECHOSOS INVOLUCRADOS:', 20, yPos);
        yPos += 7;
        
        pdf.setFont('helvetica', 'normal');
        suspects.forEach((suspect, index) => {
          if (suspect.id !== 'unknown') {
            pdf.text(`${index + 1}. ${suspect.Alias || 'Sospechoso sin nombre'}`, 20, yPos);
            yPos += 5;
            if (suspect.PhysicalDescription) {
              const splitDesc = pdf.splitTextToSize(`   Descripción: ${suspect.PhysicalDescription}`, 170);
              pdf.text(splitDesc, 20, yPos);
              yPos += splitDesc.length * 4 + 3;
            }
          }
        });
      }
      
      // Additional notes
      if (incident.Notes) {
        yPos += 5;
        pdf.setFont('helvetica', 'bold');
        pdf.text('NOTAS ADICIONALES:', 20, yPos);
        yPos += 7;
        
        pdf.setFont('helvetica', 'normal');
        const splitNotes = pdf.splitTextToSize(incident.Notes, 170);
        pdf.text(splitNotes, 20, yPos);
        yPos += splitNotes.length * 5;
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
      
      // Add small logo in footer
      try {
        const logoResponse = await fetch('/logo-light.png');
        const logoBlob = await logoResponse.blob();
        const logoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(logoBlob);
        });
        
        pdf.addImage(logoBase64, 'PNG', 95, pageHeight - 15, 20, 8);
      } catch {
        pdf.text('PW Retails', 105, pageHeight - 13, { align: 'center' });
      }
      
      pdf.setFontSize(9);
      pdf.text(`Generado el: ${new Date().toLocaleDateString('es-PY')} a las ${new Date().toLocaleTimeString('es-PY')}`, 105, pageHeight - 5, { align: 'center' });
      
      pdf.save(`Incidente-${incident.id}.pdf`);
      toast({ title: "PDF generado", description: "Descarga iniciada correctamente." });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast({ title: "Error", description: "No se pudo generar el PDF.", variant: "destructive" });
    } finally {
      setGeneratingPdf(false);
    }
  };
  
  // Map location with better coordinates handling
  const mapLocations = office ? [
    {
      id: `incident-${incident?.id}`,
      lat: office.Geo ? parseFloat(office.Geo.split(',')[0]) : -25.2637, // Use actual coordinates or default to Asunción
      lng: office.Geo ? parseFloat(office.Geo.split(',')[1]) : -57.5759,
      title: office.Name,
      address: office.Address || 'Dirección no disponible',
      logoUrl: companyLogo || undefined,
      officeId: office.id,
      popupContent: `
        <div class="mapbox-popup-content-inner">
          ${companyLogo ? `<img src="${companyLogo}" alt="Logo" class="h-8 mb-2 object-contain" />` : ''}
          <h3 class="mapbox-popup-title">${office.Name}</h3>
          <p class="mapbox-popup-address">${office.Address || 'Dirección no disponible'}</p>
          ${office.Phone ? `<p class="mapbox-popup-address">Tel: ${office.Phone}</p>` : ''}
          ${incident?.Date ? `<p class="mapbox-popup-address">Incidente: ${format(new Date(incident.Date), 'dd/MM/yyyy', { locale: es })}</p>` : ''}
          <a href="/dashboard/incidentes/${incident?.id}" class="text-primary text-xs hover:underline">Ver detalles</a>
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
          <Button onClick={handleBack} className="bg-primary hover:bg-primary/90">Volver</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
    <div className="container mx-auto py-6 px-4 md:px-6">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/incidentes">Incidentes</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{incident.id.toString().slice(0, 8)}...</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      {/* Header with back button and title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <Button variant="outline" size="icon" onClick={handleBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                REPORTE DE INCIDENTE
              </Badge>
                <Badge variant="outline" className="bg-muted">
                  ID: {incident.id.toString().slice(0, 8)}...
              </Badge>
            </div>
              <h1 className="text-3xl font-bold text-foreground">
              {incidentType} - {incident.Date && format(new Date(incident.Date), 'dd/MM/yyyy', { locale: es })}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={generatePDF}
            disabled={generatingPdf}
          >
            {generatingPdf ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
            Imprimir PDF
          </Button>
        </div>
      </div>
      
        {/* Info Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-accent/20 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha y Hora</p>
                  <p className="font-semibold text-foreground">
                    {incident.Date && format(new Date(incident.Date), 'dd/MM/yyyy', { locale: es })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {incident.Time && incident.Time.substring(0, 5)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
              
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-lg">
                <Building className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Ubicación</p>
                  <p className="font-semibold text-foreground truncate">
                    {office?.Name || `PUNTO ${incident.Office}`}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {office?.Address || 'Avenida 2000 esquina calle sin nombre.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-secondary/50 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-secondary-foreground" />
            </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Incidente</p>
                  <p className="font-semibold text-foreground">{incidentType}</p>
                </div>
              </div>
            </CardContent>
          </Card>
              
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-destructive/20 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pérdida Total</p>
                  <p className="font-bold text-destructive text-lg">{getTotalLoss()}</p>
                  <p className="text-sm text-muted-foreground">{suspects.length} sospechoso{suspects.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </CardContent>
      </Card>
        </div>
      
      {/* Main content grid */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
          {/* Left Column - Description */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-card border-border">
              <CardHeader className="bg-muted/30 border-b border-border">
                <CardTitle className="flex items-center text-lg text-foreground">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
              Descripción del Incidente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
                <div className="prose prose-sm max-w-none">
                  <div className="bg-muted/30 p-4 rounded-lg mb-4">
                    <p className="text-foreground whitespace-pre-line leading-relaxed">
                      {incident.Description || 'Sin descripción'}
                    </p>
                  </div>
              
              {incident.Notes && (
                    <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
                      <h3 className="text-sm font-semibold mb-2 text-accent-foreground">Notas Adicionales</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                        {incident.Notes}
                      </p>
                    </div>
              )}
            </div>
            
            {/* Loss breakdown */}
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-foreground">
                    <DollarSign className="h-5 w-5 mr-2 text-destructive" />
                Desglose de Pérdidas
              </h3>
                  <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Efectivo</span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(incident.CashLoss || incident.cashLoss || 0)}
                      </span>
                </div>
                    <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Mercadería</span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(incident.MerchandiseLoss || incident.merchandiseLoss || 0)}
                      </span>
                </div>
                    <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Otros</span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(incident.OtherLosses || incident.otherLosses || 0)}
                      </span>
                    </div>
                    <div className="border-t border-destructive/20 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">Total</span>
                        <span className="font-bold text-destructive text-lg">{getTotalLoss()}</span>
                </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
            {/* Suspects Card */}
            <Card className="bg-card border-border">
              <CardHeader className="bg-muted/30 border-b border-border">
                <CardTitle className="flex items-center text-lg text-foreground">
                  <Users className="h-5 w-5 mr-2 text-primary" />
              Sospechosos Involucrados
            </CardTitle>
          </CardHeader>
              <CardContent className="p-6">
            {suspectsLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
                  <div className="space-y-4">
                {suspects.map(suspect => (
                      <div key={suspect.id}>
                    {suspect.id !== 'unknown' ? (
                      <Link 
                        href={`/dashboard/suspects/${suspect.id}`} 
                            className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors group"
                      >
                            <div className="h-12 w-12 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
                          {suspect.PhotoUrl ? (
                            <Image 
                              src={suspect.PhotoUrl} 
                                  alt={suspect.Alias || 'Sospechoso'}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          ) : (
                            <User className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                              <p className="font-medium text-primary group-hover:text-primary/80">
                                {suspect.Alias || 'Sospechoso sin nombre'}
                              </p>
                          {suspect.PhysicalDescription && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {suspect.PhysicalDescription}
                                </p>
                          )}
                        </div>
                        {suspect.Status !== undefined && (
                              <Badge 
                                variant={suspect.Status === 1 ? "default" : "secondary"}
                                className={suspect.Status === 1 
                                  ? 'bg-primary/90 text-primary-foreground' 
                                  : 'bg-secondary text-secondary-foreground'
                                }
                              >
                                {suspect.Status === 1 ? 'Capturado' : 'Libre'}
                          </Badge>
                        )}
                      </Link>
                    ) : (
                          <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-muted/30">
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                          <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                              <p className="font-medium text-muted-foreground">Sospechoso Desconocido</p>
                              <p className="text-sm text-muted-foreground">No hay información disponible</p>
                        </div>
                            <Badge variant="secondary" className="bg-muted text-muted-foreground">
                          Desconocido
                        </Badge>
                      </div>
                    )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Map Card */}
            <Card className="bg-card border-border">
              <CardHeader className="bg-muted/30 border-b border-border">
                <CardTitle className="flex items-center text-lg text-foreground">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  Ubicación del Incidente
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-80 relative">
                  {office ? (
                    <div className="absolute inset-0 rounded-b-lg overflow-hidden">
                      <Map locations={mapLocations} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-muted/30 rounded-b-lg">
                      <div className="text-center p-6">
                        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-foreground font-medium">Ubicación no disponible</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          No se encontraron coordenadas para esta oficina
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {office && (
                  <div className="p-4 border-t border-border bg-muted/30">
                    <div className="flex items-start gap-3">
                      <Building className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{office.Name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{office.Address}</p>
                        {office.Phone && (
                          <p className="text-sm text-muted-foreground mt-1">Tel: {office.Phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
            )}
          </CardContent>
        </Card>
        
            {/* Attachments Card */}
            <Card className="bg-card border-border">
              <CardHeader className="bg-muted/30 border-b border-border">
                <CardTitle className="flex items-center text-lg text-foreground">
                  <FileImage className="h-5 w-5 mr-2 text-primary" />
              Archivos Adjuntos
            </CardTitle>
          </CardHeader>
              <CardContent className="p-6">
            {incident.Attachments && incident.Attachments.length > 0 ? (
                  <div className="space-y-3">
                {incident.Attachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="h-10 w-10 rounded bg-accent/20 flex items-center justify-center">
                          <FileImage className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{file.name}</p>
                          <p className="text-sm text-muted-foreground">Archivo adjunto</p>
                    </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Download className="h-4 w-4" />
                    </Button>
                      </div>
                ))}
                  </div>
            ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-center bg-muted/30 rounded-lg">
                <FileImage className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-foreground font-medium">No hay archivos adjuntos</p>
                    <p className="text-sm text-muted-foreground">para este incidente</p>
              </div>
            )}
          </CardContent>
        </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
