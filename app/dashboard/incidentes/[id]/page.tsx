'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import {
  DollarSign, Users, MapPin, FileText, AlertTriangle,
  Calendar, Building, FileImage, Download, Printer, User, Edit, Trash2
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import Map from '@/components/ui/map';
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { IdCell } from '@/components/ui/id-cell';
import { PoliceReportPreview } from '@/components/police-report-preview';

// Services
import { getIncidentById, deleteIncident } from '@/services/incident-service';
import { getIncidentTypeWithCache } from '@/services/incident-type-service';
import { getOffice } from '@/services/office-service';
import { getSuspectById } from '@/services/suspect-service';
import { getCompanyById } from '@/services/company-service';

// Utils
import { getSafeImageUrl } from '@/lib/utils';

// Types
import type { File } from '@/types/common';

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
  const [companyName, setCompanyName] = useState<string>('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Fetch incident data
  useEffect(() => {
    const fetchIncidentData = async () => {
      try {
        setLoading(true);
        const data = await getIncidentById(id);
        setIncident(data);
        
        // Fetch incident type
        if (data.IncidentType) {
          console.log('Incident has IncidentType:', data.IncidentType);
          try {
            const typeData = await getIncidentTypeWithCache(data.IncidentType);
            console.log('Retrieved incident type data:', typeData);
            const typeName = typeData?.Name || `Tipo ${data.IncidentType}`;
            console.log('Setting incident type name to:', typeName);
            setIncidentType(typeName);
          } catch (error) {
            console.error('Error fetching incident type:', error);
            setIncidentType(`Tipo ${data.IncidentType}`);
          }
        } else {
          console.log('Incident has no IncidentType');
          setIncidentType('Tipo no especificado');
        }
        
        // Fetch office data
        if (data.Office) {
          const officeId = typeof data.Office === 'number' ? data.Office : data.Office.id;
          console.log('Fetching office with ID:', officeId);
          const officeData = await getOffice(officeId);
          console.log('Office data received:', officeData);
          setOffice(officeData);
          
          // Fetch company data
          if (officeData?.Company) {
            console.log('Office has company ID:', officeData.Company);
            const company = await getCompanyById(officeData.Company.toString());
            console.log('Company data received:', company);
            setCompanyLogo(company?.image_url || null);
            setCompanyName(company?.name || 'Empresa no encontrada');
            console.log('Company name set to:', company?.name);
          }
        } else {
          console.log('No office data in incident');
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
  
  // Helper function to get incident loss items from either field
  const getIncidentLossItems = () => {
    if (!incident) return [];
    
    // Use IncidentItemLosses from API if available, otherwise use incidentLossItem from form
    if (incident.IncidentItemLosses && incident.IncidentItemLosses.length > 0) {
      return incident.IncidentItemLosses.map(item => ({
        id: item.id,
        description: item.Description || '',
        quantity: item.Quantity || 0,
        unitPrice: item.UnitPrice || 0,
        type: item.ItemType === 'mercaderia' ? 'mercaderia' as const : 'material' as const,
        total: item.TotalValue || 0
      }));
    }
    return incident.incidentLossItem || [];
  };

  const getTotalLoss = (): string => {
    if (!incident) return 'Gs. 0';
    
    if (incident.TotalLoss) return formatCurrency(incident.TotalLoss);
    
    // Calculate from individual components if available
    let total = 0;
    
    // Handle CashLoss
    if (incident.CashLoss) {
      total += parseFloat(incident.CashLoss);
    }
    
    // Handle MerchandiseLoss
    if (incident.MerchandiseLoss) {
      total += parseFloat(incident.MerchandiseLoss);
    }
    
    // Handle OtherLosses
    if (incident.OtherLosses) {
      total += parseFloat(incident.OtherLosses);
    }
    
    return formatCurrency(total);
  };
  
  // Handle back button
  const handleBack = () => {
    router.back();
  };

  const handleDeleteIncident = async () => {
    if (!incident) return;

    setIsDeleting(true);
    try {
      await deleteIncident(incident.id);
      toast({
        title: "Incidente eliminado",
        description: "El incidente ha sido eliminado correctamente.",
      });
      router.push('/dashboard/incidentes');
    } catch (error) {
      console.error('Error deleting incident:', error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el incidente. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Handle file download
  const handleFileDownload = async (file: File) => {
    try {
      console.log('Downloading file:', file);
      
      const downloadFile = async (url: string) => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.blob();
      };

      let blob: Blob;
      
      // Try different download strategies
      if (file.url.includes('cloudinary.com') || file.url.includes('res.cloudinary.com')) {
        // For Cloudinary files, use the URL directly
        console.log('Downloading from Cloudinary:', file.url);
        blob = await downloadFile(file.url);
      } else if (file.url.includes('/media/')) {
        // For backend media files, try our API route first
        const mediaPath = file.url.replace(/^.*\/media\//, '');
        const apiUrl = `/api/media/${mediaPath}`;
        
        console.log('Trying API route:', apiUrl);
        try {
          blob = await downloadFile(apiUrl);
        } catch (apiError) {
          console.warn('API route failed, trying direct URL:', apiError);
          // If API route fails, try direct URL with current cookies
          blob = await downloadFile(file.url);
        }
      } else {
        // For other files, try the URL directly
        console.log('Downloading directly from:', file.url);
        blob = await downloadFile(file.url);
      }
      
      console.log('Blob created:', blob.size, 'bytes, type:', blob.type);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name || 'archivo_adjunto';
      link.style.display = 'none';
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "Descarga completada",
        description: `El archivo "${file.name}" se ha descargado correctamente.`,
      });
      
    } catch (error) {
      console.error('Error downloading file:', error);
      
      // Fallback: try opening the file in a new tab
      console.log('Trying fallback: opening in new tab');
      try {
        const link = document.createElement('a');
        link.href = file.url;
        link.target = '_blank';
        link.download = file.name || 'archivo_adjunto';
        link.click();
        
        toast({
          title: "Archivo abierto",
          description: `Se abrió "${file.name}" en una nueva pestaña. Usa Ctrl+S para guardar.`,
        });
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        toast({
          title: "Error al descargar",
          description: `No se pudo descargar "${file.name}". Verifica tu conexión e inténtalo de nuevo.`,
          variant: "destructive",
        });
      }
    }
  };

  // Generate PDF function using the improved component
  const generatePDF = async () => {
    if (!incident) return;
    
    try {
      // Create a temporary container for the report
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '800px';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.padding = '20px';
      document.body.appendChild(tempContainer);
      
      // Render the PoliceReportPreview component
      const reportElement = (
        <PoliceReportPreview 
          incidentData={incident} 
          incidentTypes={[{ id: incident.IncidentType, name: incidentType }]} 
          office={office}
          companyLogo={companyLogo}
          companyName={companyName}
          suspects={suspects}
        />
      );
      
      // Use ReactDOM to render the component
      const ReactDOM = await import('react-dom/client');
      const root = ReactDOM.createRoot(tempContainer);
      root.render(reportElement);
      
      // Wait a bit for the component to render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Generate PDF using html2canvas and jsPDF
      const html2canvas = await import('html2canvas');
      const canvas = await html2canvas.default(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Clean up
      document.body.removeChild(tempContainer);
      
      // Open PDF in new window for printing
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const newWindow = window.open(pdfUrl, '_blank');
      
      if (newWindow) {
        // Wait for the PDF to load and then trigger print
        newWindow.onload = () => {
          setTimeout(() => {
            newWindow.print();
          }, 1000);
        };
        toast({ title: "PDF generado", description: "El PDF se abrirá para imprimir" });
      } else {
        // Fallback: download the PDF
      pdf.save(`incidente-${incident.id}.pdf`);
      toast({ title: "PDF generado", description: "El PDF se ha descargado correctamente" });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({ title: "Error", description: "No se pudo generar el PDF", variant: "destructive" });
    }
  };
  
  // Map location with better coordinates handling
  const mapLocations = office && incident ? [
    {
      id: `incident-${incident.id}`,
      lat: office.Geo ? parseFloat(office.Geo.split(',')[0]) : -25.2637, // Use actual coordinates or default to Asunción
      lng: office.Geo ? parseFloat(office.Geo.split(',')[1]) : -57.5759,
      title: office.Name,
      description: office.Address || 'Dirección no disponible',
      address: office.Address || 'Dirección no disponible',
      logoUrl: getSafeImageUrl(companyLogo) || undefined,
      officeId: office.id,
      incidentData: {
        id: incident.id,
        date: incident.Date,
        time: incident.Time || '',
        incidentType: incidentType,
        totalLoss: incident.TotalLoss || '0',
        suspectCount: suspects.length,
        status: 'Reportado',
        severity: (() => {
          const totalLoss = parseFloat(incident.TotalLoss || '0');
          if (totalLoss > 1000000) return 'high' as const;
          if (totalLoss > 100000) return 'medium' as const;
          return 'low' as const;
        })()
      }
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
      <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/incidentes">Incidentes</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{incident?.id || 'Detalle de incidente'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      
        {/* Header Card */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              {/* Tipo de incidente y estado */}
              <div className="flex flex-col items-center space-y-3">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 overflow-hidden border-4 border-muted flex items-center justify-center bg-muted">
                  {companyLogo ? (
                    <Image
                      src={getSafeImageUrl(companyLogo) || ''}
                      alt="Logo de la empresa"
                      fill
                      className="object-contain p-4"
                    />
                  ) : (
                    <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground" />
                  )}
                </div>
                <Badge variant="secondary" className="text-sm">
                  {incidentType || 'Tipo no especificado'}
                </Badge>
              </div>
              
              {/* Información principal */}
              <div className="flex-1 space-y-4 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-4 sm:gap-2">
              <div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <h2 className="text-xl sm:text-2xl font-bold">Incidente</h2>
                      {incident?.id && <IdCell id={incident.id} basePath="incidentes" />}
                    </div>
                    <p className="text-base sm:text-lg text-muted-foreground mt-1">
                      {incident?.Date && format(new Date(incident.Date), "d 'de' MMMM 'de' yyyy", { locale: es })}
                      {incident?.Time && ` - ${incident.Time}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={generatePDF} className="h-9 px-3 sm:h-10 sm:px-4">
                      <Download className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Descargar PDF</span>
                      <span className="sm:hidden">PDF</span>
                    </Button>
                    <Button variant="outline" asChild className="h-9 px-3 sm:h-10 sm:px-4">
                      <Link href={`/dashboard/incidentes/${incident.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Editar</span>
                        <span className="sm:hidden">Editar</span>
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowDeleteDialog(true)}
                      className="h-9 px-3 sm:h-10 sm:px-4 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Eliminar</span>
                      <span className="sm:hidden">Eliminar</span>
                    </Button>
                    <Button onClick={generatePDF} className="h-9 px-3 sm:h-10 sm:px-4">
                        <Printer className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Imprimir</span>
                        <span className="sm:hidden">Imprimir</span>
                    </Button>
                </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
                  {/* Pérdida Total */}
                  <Card>
                    <CardContent className="p-3 sm:p-4 sm:pt-6">
                      <div className="text-xl sm:text-2xl font-bold">{getTotalLoss()}</div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Pérdida total</p>
                    </CardContent>
                  </Card>

                  {/* Sospechosos Involucrados */}
                  <Card>
                    <CardContent className="p-3 sm:p-4 sm:pt-6">
                      <div className="text-xl sm:text-2xl font-bold">{suspects.length}</div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Sospechosos involucrados</p>
                    </CardContent>
                  </Card>

                  {/* Sucursal */}
                  <Card>
                    <CardContent className="p-3 sm:p-4 sm:pt-6">
                      <div className="text-xl sm:text-2xl font-bold truncate">
                        {office?.Name || 'No especificada'}
                </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Sucursal</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
          
        {/* Rest of the content */}
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
                    {/* Efectivo Total */}
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Efectivo Total</span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(incident.CashLoss || 0)}
                      </span>
                    </div>

                    {/* Desglose de Efectivo si existe */}
                    {(incident.Tags?.cashFondo || incident.Tags?.cashRecaudacion) && (
                      <>
                        <div className="pl-4 space-y-2 border-l-2 border-destructive/20">
                          <div className="text-sm font-medium text-muted-foreground">Desglose de Efectivo</div>
                          {incident.Tags.cashFondo && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">• Fondo de caja</span>
                              <span className="text-sm font-medium text-foreground">
                                {formatCurrency(incident.Tags.cashFondo)}
                              </span>
                            </div>
                          )}
                          {incident.Tags.cashRecaudacion && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">• Recaudación</span>
                              <span className="text-sm font-medium text-foreground">
                                {formatCurrency(incident.Tags.cashRecaudacion)}
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Items detallados si existen */}
                    {getIncidentLossItems().length > 0 && (
                      <>
                        <div className="pt-2 space-y-4">
                          {/* Productos (Mercadería) */}
                          {getIncidentLossItems().filter(item => item.type === 'mercaderia').length > 0 && (
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">Productos Perdidos</span>
                              <div className="mt-2 space-y-2">
                                {getIncidentLossItems()
                                  .filter(item => item.type === 'mercaderia')
                                  .map((item, index) => (
                                    <div key={item.id || `mercaderia-${index}`} className="bg-green-50 border border-green-200 p-3 rounded-md">
                                      <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                          <p className="text-sm font-medium text-foreground">{item.description}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {item.quantity} unidades x {formatCurrency(item.unitPrice)}
                                          </p>
                                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                            Producto
                                          </span>
                                        </div>
                                        <span className="font-medium text-foreground">
                                          {formatCurrency(item.total)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                              <div className="border-t border-green-200 mt-2 pt-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-muted-foreground">Total Productos</span>
                                  <span className="font-medium text-foreground">
                                    {formatCurrency(
                                      getIncidentLossItems()
                                        .filter(item => item.type === 'mercaderia')
                                        .reduce((sum, item) => sum + item.total, 0)
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Daños Materiales */}
                          {getIncidentLossItems().filter(item => item.type === 'material').length > 0 && (
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">Daños Materiales</span>
                              <div className="mt-2 space-y-2">
                                {getIncidentLossItems()
                                  .filter(item => item.type === 'material')
                                  .map((item, index) => (
                                    <div key={item.id || `material-${index}`} className="bg-orange-50 border border-orange-200 p-3 rounded-md">
                                      <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                          <p className="text-sm font-medium text-foreground">{item.description}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {item.quantity} unidades x {formatCurrency(item.unitPrice)}
                                          </p>
                                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                                            Daño Material
                                          </span>
                                        </div>
                                        <span className="font-medium text-foreground">
                                          {formatCurrency(item.total)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                              <div className="border-t border-orange-200 mt-2 pt-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-muted-foreground">Total Daños Materiales</span>
                                  <span className="font-medium text-foreground">
                                    {formatCurrency(
                                      getIncidentLossItems()
                                        .filter(item => item.type === 'material')
                                        .reduce((sum, item) => sum + item.total, 0)
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Total general si hay items */}
                          {getIncidentLossItems().length > 0 && (
                            <div className="border-t border-destructive/20 pt-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-muted-foreground">Total Items</span>
                                <span className="font-medium text-foreground">
                                  {formatCurrency(
                                    getIncidentLossItems().reduce((sum, item) => sum + item.total, 0)
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Otros */}
                    <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Otros</span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(incident.OtherLosses || 0)}
                      </span>
                    </div>

                    {/* Total General */}
                    <div className="border-t border-destructive/20 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">Total General</span>
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
                        href={`/dashboard/sospechosos/${suspect.id}`} 
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
              Evidencias/Archivos adjuntos
            </CardTitle>
          </CardHeader>
              <CardContent className="p-6">
            {(incident.Attachments && incident.Attachments.length > 0) || (incident.Images && incident.Images.length > 0) ? (
                  <div className="space-y-4">
                {/* Show both Attachments and Images */}
                {[...(incident.Attachments || []), ...(incident.Images || [])].map((file, index) => {
                  const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name || file.url || '');
                  return (
                      <div key={index} className="border border-border rounded-lg overflow-hidden">
                        {isImage ? (
                          <div className="space-y-3">
                            <div className="relative aspect-video bg-muted">
                              <Image 
                                src={getSafeImageUrl(file.url) || file.url} 
                                alt={file.name || 'Imagen de evidencia'}
                                fill
                                className="object-contain"
                                onError={(e) => {
                                  // Fallback if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="hidden absolute inset-0 flex items-center justify-center bg-muted">
                                <FileImage className="h-12 w-12 text-muted-foreground" />
                              </div>
                            </div>
                            <div className="p-3 bg-muted/30">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-foreground">{file.name || 'Imagen de evidencia'}</p>
                                  <p className="text-sm text-muted-foreground">Evidencia fotográfica</p>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8"
                                  onClick={() => handleFileDownload(file)}
                                  title={`Descargar ${file.name || 'imagen'}`}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Descargar
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
                            <div className="h-12 w-12 rounded bg-accent/20 flex items-center justify-center">
                              <FileText className="h-6 w-6 text-accent-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground">{file.name || 'Archivo adjunto'}</p>
                              <p className="text-sm text-muted-foreground">Archivo de evidencia</p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8"
                              onClick={() => handleFileDownload(file)}
                              title={`Descargar ${file.name || 'archivo'}`}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Descargar
                            </Button>
                          </div>
                        )}
                      </div>
                  );
                })}
                  </div>
            ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-center bg-muted/30 rounded-lg">
                <FileImage className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-foreground font-medium">No hay evidencias</p>
                    <p className="text-sm text-muted-foreground">para este incidente</p>
              </div>
            )}
          </CardContent>
        </Card>

          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteIncident}
        title="¿Eliminar incidente?"
        description="Esta acción no se puede deshacer. Se eliminará permanentemente el incidente y toda su información asociada."
        itemName={incident ? `Incidente ${incident.id}` : undefined}
        isLoading={isDeleting}
      />
    </div>
  );
}
