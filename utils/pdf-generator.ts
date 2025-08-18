import jsPDF from 'jspdf';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Incident } from '@/types/incident';
import { Suspect } from '@/types/suspect';
import { Office } from '@/types/office';

interface PDFGeneratorProps {
  incidentData: Incident;
  suspects?: Suspect[];
  incidentTypes: Array<{ id: number; name: string }>;
  office?: Office | null;
  companyLogo?: string | null;
  companyName?: string;
}

// Helper functions
const getBranchName = (office: number | string | Office) => {
  if (typeof office === 'object' && office !== null) {
    return office.Name || `Oficina ${office.id}`;
  }
  const id = typeof office === 'string' ? parseInt(office, 10) : office;
  return `Oficina ${id}`;
};

const getIncidentTypeName = (typeId: number, types: Array<{ id: number; name: string }>) => {
  const type = types.find(t => t.id === typeId);
  return type ? type.name : `Tipo ${typeId}`;
};

const getIncidentLossItems = (incident: Incident) => {
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

export async function generatePoliceReportPDF({
  incidentData,
  suspects = [],
  incidentTypes = [],
  office = null,
  companyName = '',
  companyLogo = null,
}: PDFGeneratorProps) {
  if (!incidentData) return;

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 6;
  let yPosition = margin;

  // Function to add new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Function to add text with automatic line wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 10) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    for (let i = 0; i < lines.length; i++) {
      checkPageBreak(lineHeight);
      pdf.text(lines[i], x, yPosition);
      yPosition += lineHeight;
    }
    return yPosition;
  };

  // Function to draw a section border
  const drawSectionBorder = (x: number, y: number, width: number, height: number) => {
    pdf.setLineWidth(0.5);
    pdf.rect(x, y, width, height);
  };

  // Function to draw a table
  const drawTable = (headers: string[], rows: string[][], startX: number, startY: number, columnWidths: number[]) => {
    const tableStartY = startY;
    let currentY = tableStartY;
    const rowHeight = 8;
    
    // Draw header
    pdf.setFillColor(240, 240, 240);
    pdf.rect(startX, currentY, columnWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    let currentX = startX;
    headers.forEach((header, index) => {
      pdf.text(header, currentX + 2, currentY + 5);
      currentX += columnWidths[index];
    });
    currentY += rowHeight;
    
    // Draw rows
    pdf.setFont('helvetica', 'normal');
    rows.forEach(row => {
      currentX = startX;
      row.forEach((cell, index) => {
        const cellText = cell.length > 25 ? cell.substring(0, 22) + '...' : cell;
        pdf.text(cellText, currentX + 2, currentY + 5);
        currentX += columnWidths[index];
      });
      currentY += rowHeight;
    });
    
    // Draw table borders
    pdf.setLineWidth(0.3);
    // Horizontal lines
    for (let i = 0; i <= rows.length + 1; i++) {
      pdf.line(startX, tableStartY + (i * rowHeight), startX + columnWidths.reduce((a, b) => a + b, 0), tableStartY + (i * rowHeight));
    }
    // Vertical lines
    currentX = startX;
    for (let i = 0; i <= columnWidths.length; i++) {
      pdf.line(currentX, tableStartY, currentX, currentY);
      if (i < columnWidths.length) {
        currentX += columnWidths[i];
      }
    }
    
    return currentY;
  };

  // Function to add image to PDF
  const addImageToPDF = async (imageUrl: string, x: number, y: number, maxWidth: number, maxHeight: number) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      return new Promise<{ width: number; height: number }>((resolve, reject) => {
        img.onload = () => {
          let { width, height } = img;
          const aspectRatio = width / height;
          
          if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
          }
          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          const imageData = canvas.toDataURL('image/jpeg', 0.8);
          pdf.addImage(imageData, 'JPEG', x, y, width * 0.264583, height * 0.264583);
          
          resolve({ width: width * 0.264583, height: height * 0.264583 });
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;
      });
    } catch (error) {
      return { width: 0, height: 0 };
    }
  };

  // Header with logos
  const headerHeight = 30;
  drawSectionBorder(margin, yPosition, pageWidth - 2 * margin, headerHeight);
  
  // Company logo (left side)
  if (companyLogo) {
    try {
      await addImageToPDF(companyLogo, margin + 5, yPosition + 5, 25, 20);
    } catch (error) {
      // Could not load company logo - continue without it
    }
  }
  
  // Title (center)
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INFORME DE INCIDENTE POLICIAL', pageWidth / 2, yPosition + 12, { align: 'center' });
  pdf.setFontSize(14);
  pdf.text(`N° ${String(incidentData.id).padStart(6, '0')}`, pageWidth / 2, yPosition + 20, { align: 'center' });
  
  // Powervision logo (right side)
  try {
    const powervisionLogoUrl = '/logo-dark.png';
    await addImageToPDF(powervisionLogoUrl, pageWidth - margin - 30, yPosition + 5, 25, 20);
  } catch (error) {
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Powervision', pageWidth - margin - 15, yPosition + 15, { align: 'center' });
  }
  
  yPosition += headerHeight + 10;

  // Generation info
  const generationDateTime = format(new Date(), 'dd/MM/yyyy - HH:mm', { locale: es });
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  if (companyName) {
    pdf.text(`Empresa: ${companyName}`, margin, yPosition);
    yPosition += lineHeight;
  }
  pdf.text(`Fecha de generación: ${generationDateTime}`, margin, yPosition);
  yPosition += 15;

  // Section 1: Incident Data
  checkPageBreak(50);
  let sectionStart = yPosition;
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('1. DATOS DEL INCIDENTE', margin + 5, yPosition + 5);
  yPosition += 15;

  const formatDateTime = () => {
    try {
      if (incidentData.Date && incidentData.Time) {
        const dateTime = parseISO(`${incidentData.Date}T${incidentData.Time}`);
        return format(dateTime, 'dd/MM/yyyy - HH:mm', { locale: es });
      }
      return `${incidentData.Date || 'N/A'} - ${incidentData.Time || 'N/A'}`;
    } catch {
      return `${incidentData.Date || 'N/A'} - ${incidentData.Time || 'N/A'}`;
    }
  };

  // Incident data table
  const incidentHeaders = ['Campo', 'Valor'];
  const incidentRows = [
    ['ID del Incidente', `#${incidentData.id}`],
    ['Fecha y Hora', formatDateTime()],
    ['Sucursal', office ? getBranchName(office) : 'No especificada'],
    ['Tipo de Incidente', getIncidentTypeName(incidentData.IncidentType, incidentTypes)],
    ['Dirección', office?.Address || 'No especificada'],
  ];
  
  let tableEndY = drawTable(incidentHeaders, incidentRows, margin, yPosition, [60, 120]);
  yPosition = tableEndY + 5;
  
  drawSectionBorder(margin, sectionStart, pageWidth - 2 * margin, yPosition - sectionStart);
  yPosition += 10;

  // Section 2: Description
  checkPageBreak(30);
  sectionStart = yPosition;
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('2. DESCRIPCIÓN DEL INCIDENTE', margin + 5, yPosition + 5);
  yPosition += 15;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  if (incidentData.Description && incidentData.Description.trim() !== '') {
    addWrappedText(incidentData.Description, margin + 5, yPosition, pageWidth - 2 * margin - 10);
  } else {
    pdf.text('No se proporcionó descripción del incidente', margin + 5, yPosition);
    yPosition += lineHeight;
  }
  yPosition += 10;

  // Notes section
  if (incidentData.Notes && incidentData.Notes.trim() !== '') {
    checkPageBreak(20);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Notas adicionales:', margin + 5, yPosition);
    yPosition += lineHeight;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    addWrappedText(incidentData.Notes, margin + 5, yPosition, pageWidth - 2 * margin - 10);
    yPosition += 5;
  }

  drawSectionBorder(margin, sectionStart, pageWidth - 2 * margin, yPosition - sectionStart);
  yPosition += 10;

  // Section 3: Losses
  checkPageBreak(50);
  sectionStart = yPosition;
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('3. PÉRDIDAS REPORTADAS', margin + 5, yPosition + 5);
  yPosition += 15;

  // Cash losses with breakdown
  const cashFondo = parseFloat(incidentData.Tags?.cashFondo || '0');
  const cashRecaudacion = parseFloat(incidentData.Tags?.cashRecaudacion || '0');
  const totalCash = parseFloat(incidentData.CashLoss || '0');

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('3.1 EFECTIVO', margin + 5, yPosition);
  yPosition += 10;

  if (cashFondo > 0 || cashRecaudacion > 0) {
    const cashHeaders = ['Tipo', 'Monto'];
    const cashRows = [
      ['Fondo de caja', `₲${cashFondo.toLocaleString('es-PY')}`],
      ['Recaudación', `₲${cashRecaudacion.toLocaleString('es-PY')}`],
      ['TOTAL EFECTIVO', `₲${totalCash.toLocaleString('es-PY')}`]
    ];
    
    tableEndY = drawTable(cashHeaders, cashRows, margin, yPosition, [80, 80]);
    yPosition = tableEndY + 10;
  } else {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total Efectivo: ₲${totalCash.toLocaleString('es-PY')}`, margin + 10, yPosition);
    yPosition += 15;
  }

  // Merchandise losses
  const lossItems = getIncidentLossItems(incidentData);
  const merchandiseItems = lossItems.filter(item => item.type === 'mercaderia');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('3.2 MERCANCÍA', margin + 5, yPosition);
  yPosition += 10;

  if (merchandiseItems.length > 0) {
    const merchHeaders = ['Descripción', 'Cant.', 'P. Unit.', 'Total'];
    const merchRows = merchandiseItems.map(item => [
      item.description,
      String(item.quantity),
      `₲${item.unitPrice.toLocaleString('es-PY')}`,
      `₲${item.total.toLocaleString('es-PY')}`
    ]);
    
    tableEndY = drawTable(merchHeaders, merchRows, margin, yPosition, [60, 30, 45, 45]);
    yPosition = tableEndY + 5;
  }
  
  const merchandiseTotal = parseFloat(incidentData.MerchandiseLoss || '0');
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Total Mercancía: ₲${merchandiseTotal.toLocaleString('es-PY')}`, margin + 10, yPosition);
  yPosition += 15;

  // Material damages
  const materialItems = lossItems.filter(item => item.type === 'material');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('3.3 DAÑOS MATERIALES', margin + 5, yPosition);
  yPosition += 10;

  if (materialItems.length > 0) {
    const materialHeaders = ['Descripción', 'Cant.', 'P. Unit.', 'Total'];
    const materialRows = materialItems.map(item => [
      item.description,
      String(item.quantity),
      `₲${item.unitPrice.toLocaleString('es-PY')}`,
      `₲${item.total.toLocaleString('es-PY')}`
    ]);
    
    tableEndY = drawTable(materialHeaders, materialRows, margin, yPosition, [60, 30, 45, 45]);
    yPosition = tableEndY + 5;
  }
  
  const otherLossesTotal = parseFloat(incidentData.OtherLosses || '0');
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Total Daños Materiales: ₲${otherLossesTotal.toLocaleString('es-PY')}`, margin + 10, yPosition);
  yPosition += 15;

  // Total general
  const totalLoss = parseFloat(incidentData.TotalLoss || '0') || (totalCash + merchandiseTotal + otherLossesTotal);
  pdf.setFillColor(255, 240, 240);
  pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 15, 'F');
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`TOTAL GENERAL: ₲${totalLoss.toLocaleString('es-PY')}`, pageWidth / 2, yPosition + 5, { align: 'center' });
  yPosition += 15;

  drawSectionBorder(margin, sectionStart, pageWidth - 2 * margin, yPosition - sectionStart);
  yPosition += 10;

  // Section 4: Suspects
  if (suspects && suspects.length > 0) {
    suspects.forEach((suspect, index) => {
      checkPageBreak(60);
      sectionStart = yPosition;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`4.${index + 1} SOSPECHOSO #${index + 1}`, margin + 5, yPosition + 5);
      yPosition += 15;

      // Suspect basic info table
      const suspectHeaders = ['Campo', 'Valor'];
      const suspectRows = [
        ['Alias', suspect.Alias || 'No especificado'],
        ['ID', suspect.id],
        ['Estado', suspect.Status === 1 ? 'Detenido' : suspect.Status === 2 ? 'Libre' : 'Desconocido']
      ];
      
      tableEndY = drawTable(suspectHeaders, suspectRows, margin, yPosition, [60, 120]);
      yPosition = tableEndY + 10;

      // Physical description
      if (suspect.PhysicalDescription) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Descripción física:', margin + 5, yPosition);
        yPosition += 8;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        addWrappedText(suspect.PhysicalDescription, margin + 5, yPosition, pageWidth - 2 * margin - 10);
        yPosition += 5;
      }

      // Tags/Characteristics
      if (suspect.Tags && Object.keys(suspect.Tags).length > 0) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Características distintivas:', margin + 5, yPosition);
        yPosition += 8;
        
        const tagHeaders = ['Característica', 'Valor'];
        const tagRows: string[][] = [];
        
        Object.entries(suspect.Tags).forEach(([key, value]) => {
          if (value) {
            const label = key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            tagRows.push([label, String(value)]);
          }
        });
        
        if (tagRows.length > 0) {
          tableEndY = drawTable(tagHeaders, tagRows, margin, yPosition, [70, 110]);
          yPosition = tableEndY + 5;
        }
      }

      drawSectionBorder(margin, sectionStart, pageWidth - 2 * margin, yPosition - sectionStart);
      yPosition += 10;
    });
  }

  // Section 5: Evidence and Attachments
  if ((incidentData.Attachments && incidentData.Attachments.length > 0) || (incidentData.Images && incidentData.Images.length > 0)) {
    checkPageBreak(50);
    sectionStart = yPosition;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('5. EVIDENCIAS Y ARCHIVOS ADJUNTOS', margin + 5, yPosition + 5);
    yPosition += 15;

    // Images section
    if (incidentData.Images && incidentData.Images.length > 0) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('5.1 IMÁGENES DEL INCIDENTE', margin + 5, yPosition);
      yPosition += 10;

      const imageHeaders = ['#', 'Nombre del Archivo'];
      const imageRows = incidentData.Images.map((image, index) => [
        String(index + 1),
        image.name || `Imagen ${index + 1}`
      ]);
      
      tableEndY = drawTable(imageHeaders, imageRows, margin, yPosition, [20, 160]);
      yPosition = tableEndY + 10;

      // Try to display actual images
      for (let i = 0; i < Math.min(incidentData.Images.length, 4); i++) {
        const image = incidentData.Images[i];
        if (image.url) {
          try {
            checkPageBreak(50);
            const imageDimensions = await addImageToPDF(image.url, margin, yPosition, 80, 60);
            yPosition += imageDimensions.height + 10;
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            pdf.text(image.name || `Imagen ${i + 1}`, margin, yPosition);
            yPosition += 15;
          } catch (error) {
            console.error('Could not add image to PDF:', error);
          }
        }
      }
    }

    // Attachments section
    if (incidentData.Attachments && incidentData.Attachments.length > 0) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('5.2 ARCHIVOS ADJUNTOS', margin + 5, yPosition);
      yPosition += 10;
      
      const attachHeaders = ['#', 'Nombre del Archivo', 'Tipo'];
      const attachRows = incidentData.Attachments.map((attachment, index) => [
        String(index + 1),
        attachment.name || `Archivo ${index + 1}`,
        attachment.contentType || 'Desconocido'
      ]);
      
      tableEndY = drawTable(attachHeaders, attachRows, margin, yPosition, [20, 100, 60]);
      yPosition = tableEndY + 10;
    }

    drawSectionBorder(margin, sectionStart, pageWidth - 2 * margin, yPosition - sectionStart);
    yPosition += 10;
  }

  // Footer - signatures
  checkPageBreak(40);
  yPosition = pageHeight - 60;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  // Signature lines
  pdf.line(margin, yPosition, margin + 60, yPosition);
  pdf.line(pageWidth - margin - 60, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('DENUNCIANTE', margin + 15, yPosition);
  pdf.text('OFICIAL DE POLICÍA', pageWidth - margin - 45, yPosition);
  yPosition += lineHeight;
  
  pdf.setFont('helvetica', 'normal');
  pdf.text('Nombre y Apellido', margin + 10, yPosition);
  pdf.text('Nombre, Apellido y Grado', pageWidth - margin - 60, yPosition);
  yPosition += 15;
  
  // Document footer
  pdf.setFontSize(8);
  pdf.text('Documento oficial de registro de incidente - Powervision', pageWidth / 2, yPosition, { align: 'center' });
  pdf.text(`Generado el ${generationDateTime}`, pageWidth / 2, yPosition + 5, { align: 'center' });

  // Save PDF
  pdf.save(`informe-incidente-${incidentData.id}.pdf`);
}