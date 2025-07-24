'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  FileText, 
  Printer,
  CheckCircle2,
  Info,
  Download
} from 'lucide-react';
import jsPDF from 'jspdf';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { loadMockData } from './mock-data';
import { PoliceReportPreview } from '@/components/police-report-preview';

export default function IncidentPreviewPage() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [incidentData, setIncidentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem('current_incident');
    if (storedData) {
      try {
        setIncidentData(JSON.parse(storedData));
      } catch (e) {
        console.error('Error parsing stored incident data:', e);
        setIncidentData(loadMockData());
        toast({ title: "Usando datos de ejemplo", description: "Error al cargar datos, mostrando demo." });
      }
    } else {
      setIncidentData(loadMockData());
      toast({ title: "Usando datos de ejemplo", description: "Mostrando demo." });
    }
    setLoading(false);
  }, []);

  const generatePDF = async () => {
    if (!incidentData) return;
    setGeneratingPdf(true);
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.width;
      
      // Load and add logo
      try {
        const logoResponse = await fetch('/logo-dark.png');
        const logoBlob = await logoResponse.blob();
        const logoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(logoBlob);
        });
        
        // Add logo (positioned top-left)
        pdf.addImage(logoBase64, 'PNG', 20, 15, 40, 15);
      } catch (error) {
        console.warn('Could not load logo:', error);
      }
      
      // Header with better styling
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DENUNCIA POLICIAL', 105, 25, { align: 'center' });
      
      // Subtitle
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Reporte oficial de incidente', 105, 32, { align: 'center' });
      
      // Header line
      pdf.setDrawColor(50, 50, 50);
      pdf.setLineWidth(0.5);
      pdf.line(20, 40, pageWidth - 20, 40);
      
      // Reset text color
      pdf.setTextColor(0, 0, 0);
      
      // Document info box
      pdf.setFillColor(248, 249, 250);
      pdf.rect(20, 45, pageWidth - 40, 20, 'F');
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(20, 45, pageWidth - 40, 20, 'S');
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`ID del Incidente: ${incidentData.id}`, 25, 53);
      pdf.text(`Fecha: ${incidentData.date || 'No especificada'}`, 25, 60);
      pdf.text(`Hora: ${incidentData.time || 'No especificada'}`, 120, 53);
      pdf.text(`Estado: REGISTRADO`, 120, 60);
      
      // Incident details section
      let yPos = 75;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(50, 50, 50);
      pdf.text('DETALLES DEL INCIDENTE', 20, yPos);
      
      // Section underline
      pdf.setDrawColor(100, 100, 100);
      pdf.setLineWidth(0.3);
      pdf.line(20, yPos + 2, 100, yPos + 2);
      
      yPos += 12;
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      
      // Details in a structured format
      if (incidentData.branchId) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Sucursal:', 20, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(incidentData.branchId, 50, yPos);
        yPos += 8;
      }
      
      if (incidentData.incidentType) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Tipo de Incidente:', 20, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(incidentData.incidentType, 65, yPos);
        yPos += 8;
      }
      
      // Description section
      yPos += 8;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(50, 50, 50);
      pdf.text('DESCRIPCIÓN DEL INCIDENTE', 20, yPos);
      
      // Section underline
      pdf.setDrawColor(100, 100, 100);
      pdf.setLineWidth(0.3);
      pdf.line(20, yPos + 2, 120, yPos + 2);
      
      yPos += 12;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      // Description box
      const description = incidentData.description || 'Sin descripción disponible.';
      pdf.setFillColor(250, 250, 250);
      const descBoxHeight = Math.max(20, Math.ceil(description.length / 80) * 7);
      pdf.rect(20, yPos - 3, pageWidth - 40, descBoxHeight, 'F');
      pdf.setDrawColor(220, 220, 220);
      pdf.rect(20, yPos - 3, pageWidth - 40, descBoxHeight, 'S');
      
      const splitDescription = pdf.splitTextToSize(description, pageWidth - 50);
      pdf.text(splitDescription, 25, yPos + 3);
      yPos += descBoxHeight + 10;
      
      // Losses section
      if (incidentData.totalLoss || incidentData.cashLoss || incidentData.merchandiseLoss) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(50, 50, 50);
        pdf.text('PÉRDIDAS ESTIMADAS', 20, yPos);
        
        // Section underline
        pdf.setDrawColor(100, 100, 100);
        pdf.setLineWidth(0.3);
        pdf.line(20, yPos + 2, 100, yPos + 2);
        
        yPos += 12;
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);
        
        // Losses table
        pdf.setFillColor(248, 249, 250);
        pdf.rect(20, yPos - 3, pageWidth - 40, 25, 'F');
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(20, yPos - 3, pageWidth - 40, 25, 'S');
        
        if (incidentData.cashLoss) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Efectivo:', 25, yPos + 3);
          pdf.setFont('helvetica', 'normal');
          pdf.text(incidentData.cashLoss, 120, yPos + 3);
          yPos += 6;
        }
        if (incidentData.merchandiseLoss) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Mercadería:', 25, yPos + 3);
          pdf.setFont('helvetica', 'normal');
          pdf.text(incidentData.merchandiseLoss, 120, yPos + 3);
          yPos += 6;
        }
        
        // Total with highlight
        if (incidentData.totalLoss) {
          pdf.setFillColor(220, 53, 69, 0.1);
          pdf.rect(25, yPos, pageWidth - 50, 8, 'F');
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(220, 53, 69);
          pdf.text(`TOTAL: ${incidentData.totalLoss}`, 25, yPos + 5);
          pdf.setTextColor(0, 0, 0);
          yPos += 15;
        } else {
          yPos += 10;
        }
      }
      
      // Suspects section
      if (incidentData.suspects && incidentData.suspects.length > 0) {
        yPos += 8;
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(50, 50, 50);
        pdf.text('SOSPECHOSOS INVOLUCRADOS', 20, yPos);
        
        // Section underline
        pdf.setDrawColor(100, 100, 100);
        pdf.setLineWidth(0.3);
        pdf.line(20, yPos + 2, 120, yPos + 2);
        
        yPos += 12;
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);
        
        incidentData.suspects.forEach((suspect: { name?: string; description?: string }, index: number) => {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(20, yPos - 2, pageWidth - 40, 12, 'F');
          pdf.setDrawColor(220, 220, 220);
          pdf.rect(20, yPos - 2, pageWidth - 40, 12, 'S');
          
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${index + 1}. ${suspect.name || 'Sospechoso sin identificar'}`, 25, yPos + 3);
          
          if (suspect.description) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.text(suspect.description, 25, yPos + 8);
          }
          
          yPos += 15;
          pdf.setFontSize(11);
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
      
      // Add small logo in footer
      try {
        const logoResponse = await fetch('/logo-dark.png');
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
      
      pdf.save(`Denuncia-${incidentData.id}.pdf`);
      toast({ title: "PDF generado", description: "Descarga iniciada." });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast({ title: "Error PDF", description: "No se pudo generar el PDF.", variant: "destructive" });
    } finally {
      setGeneratingPdf(false);
    }
  };



  const handleApprove = () => {
    toast({ title: "Denuncia registrada", description: "Guardado simulado." });
    localStorage.removeItem('current_incident');
    router.push('/dashboard/incidentes');
  };

  const handlePrint = () => {
    // Ocultar elementos que no queremos imprimir
    const printElements = document.querySelectorAll('.print\\:hidden');
    printElements.forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });

    // Imprimir la página
    window.print();

    // Restaurar elementos después de imprimir
    setTimeout(() => {
      printElements.forEach(el => {
        (el as HTMLElement).style.display = '';
      });
    }, 1000);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div></div>;
  }

  if (!incidentData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Datos no encontrados</h1>
          <p className="text-muted-foreground mb-6">No se pudo cargar la información de la denuncia.</p>
          <Button onClick={() => router.push('/dashboard/incidentes/nuevo')}>Ir al formulario</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/5 p-6 print:p-0 print:bg-white">
      <div className="mb-6 print:hidden">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4 mr-1" />Volver</Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { setIncidentData(loadMockData()); toast({ title: "Demo Recargada" }); }}><FileText className="h-4 w-4 mr-1" />Recargar Demo</Button>
            <Button variant="outline" size="sm" disabled={generatingPdf} onClick={generatePDF}>
              {generatingPdf ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Download className="h-4 w-4 mr-1" />
              )}
              Descargar PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" />
              Imprimir
            </Button>
            <Button onClick={handleApprove}><CheckCircle2 className="h-4 w-4 mr-1" />Registrar denuncia</Button>
          </div>
        </div>
      </div>
      
      <PoliceReportPreview 
        incidentData={incidentData} 
        incidentTypes={[]} 
        office={null}
        companyLogo={null}
      />
      
    </div>
  );
} 