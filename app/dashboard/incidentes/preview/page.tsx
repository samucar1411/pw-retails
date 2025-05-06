'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  FileText, 
  Printer, 
  Share2, 
  CheckCircle2,
  Info
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { loadMockData } from './mock-data';
import { PoliceReportPreview } from '@/components/police-report-preview';

type Suspect = {
  id: string;
  alias: string;
  status: string;
  description?: string;
  imageUrl?: string;
};

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
  suspectAlias?: string;
  suspectStatus?: string;
  notes?: string;
  attachments?: AttachmentMetadata[];
  created_at: string;
};

export default function IncidentPreviewPage() {
  const router = useRouter();
  const [incidentData, setIncidentData] = useState<IncidentData | null>(null);
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
      const reportElement = document.getElementById('police-report');
      if (!reportElement) throw new Error('Report element not found');
      const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgWidth = 210; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Denuncia-${incidentData.id}.pdf`);
      toast({ title: "PDF generado", description: "Descarga iniciada." });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast({ title: "Error PDF", description: "No se pudo generar el PDF.", variant: "destructive" });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handlePrint = () => window.print();

  const handleShare = async () => {
    if (typeof navigator.share !== 'undefined' && incidentData) {
      try {
        await navigator.share({
          title: `Denuncia Policial ${incidentData.id}`,
          text: `Denuncia registrada en ${incidentData.branchId}`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error al compartir:', error);
        toast({ title: "Error", description: "No se pudo compartir", variant: "destructive" });
      }
    } else {
      toast({ title: "Info", description: "Compartir no disponible." });
    }
  };

  const handleApprove = () => {
    toast({ title: "Denuncia registrada", description: "Guardado simulado." });
    localStorage.removeItem('current_incident');
    router.push('/dashboard/incidentes');
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
            <Button variant="outline" size="sm" onClick={handleShare}><Share2 className="h-4 w-4 mr-1" />Compartir</Button>
            <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="h-4 w-4 mr-1" />Imprimir</Button>
            <Button variant="outline" size="sm" disabled={generatingPdf} onClick={generatePDF}>{generatingPdf ? <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <FileText className="h-4 w-4 mr-1" />}Generar PDF</Button>
            <Button onClick={handleApprove}><CheckCircle2 className="h-4 w-4 mr-1" />Registrar denuncia</Button>
          </div>
        </div>
      </div>
      
      <PoliceReportPreview incidentData={incidentData} />
      
    </div>
  );
} 