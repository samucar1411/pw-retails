'use client';

import React from 'react';
import { generatePoliceReportPDF } from '@/utils/pdf-generator';

import { Incident } from '@/types/incident';
import { Suspect } from '@/types/suspect';
import { Office } from '@/types/office';

interface PoliceReportPreviewProps {
  incidentData: Incident;
  suspects?: Suspect[];
  incidentTypes: Array<{ id: number; name: string }>;
  office?: Office | null;
  companyLogo?: string | null;
  companyName?: string;
}


export function PoliceReportPreview({
  incidentData,
  suspects = [],
  incidentTypes = [],
  office = null,
  companyName = '',
  companyLogo = null,
}: PoliceReportPreviewProps) {
  
  const generatePDF = async () => {
    if (!incidentData) return;
    
    try {
      await generatePoliceReportPDF({
        incidentData,
        suspects,
        incidentTypes,
        office,
        companyLogo,
        companyName
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (!incidentData) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-8 text-center">
        <p className="text-gray-500">No hay datos de incidente para mostrar</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8">
      <button 
        onClick={generatePDF}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Generar PDF de Informe Policial
      </button>
      
      <div className="text-center text-gray-600">
        <p>Haz clic en el botón para generar el informe en PDF</p>
        <p className="text-sm mt-2">El PDF incluirá todos los datos del incidente con formato profesional de denuncia policial</p>
      </div>
    </div>
  );
}