'use client';

import React from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';

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


// Helper functions
const getBranchName = (office: number | string | Office) => {
  if (typeof office === 'object' && office !== null) {
    return office.Name || `Oficina ${office.id}`;
  }
  // If it's just an ID, we can't get the name without the office object
  const id = typeof office === 'string' ? parseInt(office, 10) : office;
  return `Oficina ${id}`;
};

const getIncidentTypeName = (typeId: number, types: Array<{ id: number; name: string }>) => {
  const type = types.find(t => t.id === typeId);
  return type ? type.name : `Tipo ${typeId}`;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    maximumFractionDigits: 0,
  }).format(amount);

export function PoliceReportPreview({
  incidentData,
  suspects = [],
  incidentTypes = [],
  office = null,
  companyName = '',
}: PoliceReportPreviewProps) {
  if (!incidentData) return null;

  const dateTime = parseISO(`${incidentData.Date}T${incidentData.Time}`);
  const formattedDateTime = format(dateTime, "PPP 'a las' HH:mm", { locale: es });
  const cashLoss = parseFloat(incidentData.CashLoss || '0') || 0;
  const merchandiseLoss = parseFloat(incidentData.MerchandiseLoss || '0') || 0;
  const otherLosses = parseFloat(incidentData.OtherLosses || '0') || 0;
  const totalLoss = parseFloat(incidentData.TotalLoss || '0') || cashLoss + merchandiseLoss + otherLosses;
  const detailedMerchandiseTotal =
    incidentData.incidentLossItem?.reduce((sum, item) => sum + item.total, 0) || 0;
  const hasSuspects = suspects.length > 0;

  return (
    <article
      id="police-report"
      className="max-w-4xl mx-auto bg-white text-gray-800 print:bg-white print:text-black"
    >
      {/* -- Global print styles -- */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 20mm;
          }
          body {
            -webkit-print-color-adjust: exact;
          }
          .page-break {
            page-break-after: always;
          }
        }
        
        /* Custom styles for the police report */
        .section {
          margin-bottom: 2rem;
        }
        
        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: black;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid black;
        }
        
        .subtitle {
          font-size: 1.1rem;
          font-weight: 600;
          color: black;
          margin-bottom: 0.75rem;
        }
        
        .subtitle-sm {
          font-size: 1rem;
          font-weight: 600;
          color: black;
          margin-bottom: 0.5rem;
        }
        
        .label {
          font-weight: bold;
          color: black;
          margin-bottom: 0.25rem;
          font-size: 0.875rem;
        }
        
        .label-sm {
          font-weight: bold;
          color: black;
          font-size: 0.75rem;
        }
        
        .value {
          font-size: 1rem;
          color: black;
          margin-bottom: 0.5rem;
        }
        
        .value-lg {
          font-size: 1.125rem;
          font-weight: bold;
        }
        
        .value-xl {
          font-size: 1.5rem;
          font-weight: bold;
        }
        
        .page-break-inside-avoid {
          page-break-inside: avoid;
        }
      `}</style>

      <header className="border-b-4 border-black p-6 print:p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold uppercase">Reporte de incidente</h1>
            <p className="mt-1 text-lg font-semibold">Incidente {incidentData.id}</p>
          </div>
        </div>
        <div className="text-center border-2 border-black p-3">
          <p className="text-sm font-bold">Fecha de Registro</p>
          <p className="text-lg font-bold">
            {format(new Date(), 'dd/MM/yyyy', { locale: es })}
          </p>
        </div>
      </header>

      <main className="p-6 print:p-4 space-y-8">
        {/* I. Datos del Denunciante */}
        <section className="section page-break-inside-avoid">
          <h2 className="section-title">I. Datos del Denunciante</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="label">Empresa:</p>
              <p className="value">{companyName || 'Empresa no encontrada'}</p>
            </div>
            <div>
              <p className="label">Sucursal:</p>
              <p className="value">{office ? getBranchName(office) : 'Sucursal no especificada'}</p>
            </div>
            {office?.Address && (
              <div>
                <p className="label">Dirección:</p>
                <p className="value">{office.Address}</p>
              </div>
            )}
            {office?.Phone && (
              <div>
                <p className="label">Teléfono:</p>
                <p className="value">{office.Phone}</p>
              </div>
            )}
          </div>
        </section>

        {/* II. Hecho Denunciado */}
        <section className="section page-break-inside-avoid">
          <h2 className="section-title">II. Hecho Denunciado</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="label">Fecha y Hora:</p>
              <p className="value">{formattedDateTime}</p>
            </div>
            <div>
              <p className="label">Tipo de Incidente:</p>
              <p className="value">
                {getIncidentTypeName(incidentData.IncidentType, incidentTypes)}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="label mb-2">Descripción de los hechos:</p>
            <div className="bg-gray-50 border-2 border-gray-300 p-4 print:bg-white">
              <p className="whitespace-pre-line leading-relaxed">
                {incidentData.Description || 'Sin descripción disponible'}
              </p>
            </div>
          </div>
        </section>

        {/* III. Daños y Pérdidas */}
        <section className="section page-break-inside-avoid">
          <h2 className="section-title">III. Daños y Pérdidas</h2>
          
          {/* Tabla de resumen de pérdidas */}
          <div className="mb-6">
            <h3 className="subtitle mb-3">Resumen de Pérdidas</h3>
            <table className="w-full border-collapse border-2 border-gray-400">
              <thead className="bg-gray-100 print:bg-gray-200">
                <tr>
                  <th className="border border-gray-400 p-3 text-left font-semibold">Tipo de Pérdida</th>
                  <th className="border border-gray-400 p-3 text-center font-semibold">Monto</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-3 font-medium">Dinero en efectivo</td>
                  <td className="border border-gray-400 p-3 text-center font-semibold text-red-600">
                    {formatCurrency(cashLoss)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-3 font-medium">Mercancía</td>
                  <td className="border border-gray-400 p-3 text-center font-semibold text-red-600">
                    {formatCurrency(merchandiseLoss)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-3 font-medium">Otros daños</td>
                  <td className="border border-gray-400 p-3 text-center font-semibold text-red-600">
                    {formatCurrency(otherLosses)}
                  </td>
                </tr>
                <tr className="bg-red-50 print:bg-red-100 font-bold">
                  <td className="border border-gray-400 p-3 font-bold">TOTAL GENERAL</td>
                  <td className="border border-gray-400 p-3 text-center font-bold text-red-700 text-lg">
                    {formatCurrency(totalLoss)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {incidentData.incidentLossItem?.length > 0 && (
            <div>
              <h3 className="subtitle mb-3">Detalle de Mercadería Afectada</h3>
              <table className="w-full border-collapse border-2 border-gray-400">
                <thead className="bg-gray-100 print:bg-gray-200">
                  <tr>
                    <th className="border border-gray-400 p-3 text-left font-semibold">Descripción del Producto</th>
                    <th className="border border-gray-400 p-3 text-center font-semibold">Cantidad</th>
                    <th className="border border-gray-400 p-3 text-center font-semibold">Precio Unitario</th>
                    <th className="border border-gray-400 p-3 text-center font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {incidentData.incidentLossItem.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50 print:hover:bg-transparent">
                      <td className="border border-gray-400 p-3 font-medium">{item.description}</td>
                      <td className="border border-gray-400 p-3 text-center font-semibold">{item.quantity}</td>
                      <td className="border border-gray-400 p-3 text-center font-semibold">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="border border-gray-400 p-3 text-center font-bold text-red-600">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 print:bg-gray-200 font-bold">
                    <td colSpan={3} className="border border-gray-400 p-3 text-right text-lg">
                      TOTAL MERCANCÍA
                    </td>
                    <td className="border border-gray-400 p-3 text-center font-bold text-red-700 text-lg">
                      {formatCurrency(detailedMerchandiseTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* IV. Datos de Sospechosos */}
        {hasSuspects && (
          <section className="section page-break-inside-avoid">
            <h2 className="section-title">IV. Datos de Sospechosos</h2>
            <div className="space-y-6">
              {suspects.map((s, i) => (
                <div key={s.id || i} className="border-2 border-gray-300 rounded-lg bg-white overflow-hidden">
                  {/* Header con número y estado */}
                  <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">
                        SOSPECHOSO
                      </h3>                     
                    </div>
                  </div>
                  
                  {/* Contenido principal */}
                  <div className="p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Columna 1: Foto */}
                      <div className="lg:col-span-1">
                        <h4 className="font-semibold text-gray-900 mb-3 text-sm">FOTOGRAFÍA</h4>
                        <div className="flex justify-center">
                          <div className="w-32 h-40 border-2 border-gray-300 bg-gray-100 overflow-hidden rounded-lg">
                            {s.PhotoUrl ? (
                              <div className="relative w-full h-full">
                                <Image
                                  src={s.PhotoUrl}
                                  alt={`Foto de ${s.Alias}`}
                                  fill
                                  sizes='128px'
                                  className="object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="text-gray-400 text-xs text-center">
                                  Sin foto
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Columna 2: Información básica */}
                      <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Información personal */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 text-sm border-b border-gray-200 pb-1">
                              INFORMACIÓN PERSONAL
                            </h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center">
                                <span className="font-medium text-gray-600">Alias/Apodo:</span>
                                <span className="text-gray-900 font-semibold">{s.Alias || 'No especificado'}</span>
                              </div>
                              <div className="flex items-center w-full">
                                <span className="font-medium text-gray-600">ID:</span>
                                <span className="text-gray-900 font-mono">{s.id}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="font-medium text-gray-600">Estado:</span>
                                <span className="text-gray-900">{s.Status === 1 ? 'Detenido' : 'Libre'}</span>
                              </div>
                              {s.IncidentsCount && (
                                <div className="flex">
                                  <span className="font-medium text-gray-600">Incidentes:</span>
                                  <span className="text-gray-900">{s.IncidentsCount}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Características - Siguiendo la estructura de la página de detalle */}
                        <div className="mt-6">
                          <h4 className="font-semibold text-gray-900 mb-4 text-sm border-b border-gray-200 pb-1">
                            CARACTERÍSTICAS
                          </h4>
                          
                          {/* Descripción física */}
                          {s.PhysicalDescription && (
                            <div className="mb-4">
                              <h5 className="font-medium mb-2 text-sm">Descripción física</h5>
                              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                {s.PhysicalDescription}
                              </p>
                            </div>
                          )}

                          {/* Características distintivas organizadas */}
                          {s.Tags && s.Tags.length > 0 && (
                            <div className="mb-4">
                              <h5 className="font-medium mb-4 text-sm">Características distintivas</h5>
                              <div className="bg-gray-50 border rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Género */}
                                  {s.Tags.some(tag => ['male', 'female'].includes(tag.toLowerCase())) && (
                                    <div>
                                      <h6 className="text-xs font-medium text-gray-600 mb-1">Género</h6>
                                      <p className="text-sm">
                                        {s.Tags.find(tag => ['male', 'female'].includes(tag.toLowerCase())) === 'male' ? 'Hombre' : 'Mujer'}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* Contextura */}
                                  {s.Tags.some(tag => ['flaco', 'normal', 'musculoso', 'sobrepeso'].includes(tag.toLowerCase())) && (
                                    <div>
                                      <h6 className="text-xs font-medium text-gray-600 mb-1">Contextura</h6>
                                      <p className="text-sm">
                                        {(() => {
                                          const contextura = s.Tags.find(tag => ['flaco', 'normal', 'musculoso', 'sobrepeso'].includes(tag.toLowerCase()));
                                          return contextura ? contextura.charAt(0).toUpperCase() + contextura.slice(1).toLowerCase() : '';
                                        })()}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* Estatura */}
                                  {s.Tags.some(tag => ['bajo', 'normal', 'alto', 'muy_alto'].includes(tag.toLowerCase())) && (
                                    <div>
                                      <h6 className="text-xs font-medium text-gray-600 mb-1">Estatura</h6>
                                      <p className="text-sm">
                                        {(() => {
                                          const altura = s.Tags.find(tag => ['bajo', 'normal', 'alto', 'muy_alto'].includes(tag.toLowerCase()));
                                          switch(altura?.toLowerCase()) {
                                            case 'bajo': return 'Bajo (<1.60m)';
                                            case 'normal': return 'Normal (1.60m-1.75m)';
                                            case 'alto': return 'Alto (1.76m-1.85m)';
                                            case 'muy_alto': return 'Muy Alto (>1.85m)';
                                            default: return altura;
                                          }
                                        })()}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* Tono de piel */}
                                  {s.Tags.some(tag => ['clara', 'triguena', 'oscura', 'negra'].includes(tag.toLowerCase())) && (
                                    <div>
                                      <h6 className="text-xs font-medium text-gray-600 mb-1">Tono de piel</h6>
                                      <p className="text-sm">
                                        {(() => {
                                          const piel = s.Tags.find(tag => ['clara', 'triguena', 'oscura', 'negra'].includes(tag.toLowerCase()));
                                          return piel ? piel.charAt(0).toUpperCase() + piel.slice(1).toLowerCase() : '';
                                        })()}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* Piercings */}
                                  {s.Tags.some(tag => ['nariz', 'oreja', 'cejas', 'lengua', 'labios'].includes(tag.toLowerCase())) && (
                                    <div>
                                      <h6 className="text-xs font-medium text-gray-600 mb-1">Piercings</h6>
                                      <p className="text-sm">
                                        {s.Tags
                                          .filter(tag => ['nariz', 'oreja', 'cejas', 'lengua', 'labios'].includes(tag.toLowerCase()))
                                          .map(tag => tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase())
                                          .join(', ')}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* Tatuajes */}
                                  {s.Tags.some(tag => ['brazos', 'cara', 'cuello', 'piernas', 'mano'].includes(tag.toLowerCase())) && (
                                    <div>
                                      <h6 className="text-xs font-medium text-gray-600 mb-1">Tatuajes</h6>
                                      <p className="text-sm">
                                        {s.Tags
                                          .filter(tag => ['brazos', 'cara', 'cuello', 'piernas', 'mano'].includes(tag.toLowerCase()))
                                          .map(tag => tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase())
                                          .join(', ')}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* Accesorios */}
                                  {s.Tags.some(tag => ['lentes_sol', 'bolsa', 'lentes', 'casco', 'mochila'].includes(tag.toLowerCase())) && (
                                    <div>
                                      <h6 className="text-xs font-medium text-gray-600 mb-1">Accesorios</h6>
                                      <p className="text-sm">
                                        {s.Tags
                                          .filter(tag => ['lentes_sol', 'bolsa', 'lentes', 'casco', 'mochila'].includes(tag.toLowerCase()))
                                          .map(tag => tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase().replace('_', ' '))
                                          .join(', ')}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* Comportamiento */}
                                  {s.Tags.some(tag => ['agresivo', 'nervioso', 'calmado', 'sospechoso'].includes(tag.toLowerCase())) && (
                                    <div>
                                      <h6 className="text-xs font-medium text-gray-600 mb-1">Comportamiento</h6>
                                      <p className="text-sm">
                                        {s.Tags
                                          .filter(tag => ['agresivo', 'nervioso', 'calmado', 'sospechoso'].includes(tag.toLowerCase()))
                                          .map(tag => tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase())
                                          .join(', ')}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* Elementos que dificultan identificación */}
                                  {s.Tags.some(tag => ['gorra', 'bufanda', 'mascara', 'gafas'].includes(tag.toLowerCase())) && (
                                    <div>
                                      <h6 className="text-xs font-medium text-gray-600 mb-1">Dificulta identificación</h6>
                                      <p className="text-sm">
                                        {s.Tags
                                          .filter(tag => ['gorra', 'bufanda', 'mascara', 'gafas'].includes(tag.toLowerCase()))
                                          .map(tag => tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase())
                                          .join(', ')}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Última vez visto */}
                          {s.LastSeen && (
                            <div className="mb-4">
                              <h5 className="font-medium mb-2 text-sm">Última vez visto</h5>
                              <p className="text-sm text-gray-700">
                                {format(new Date(s.LastSeen), "d 'de' MMMM 'de' yyyy", { locale: es })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      <footer className="border-t-4 border-black p-6 print:p-4 text-center">
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          {['DENUNCIANTE', 'OFICIAL DE POLICÍA'].map((role, idx) => (
            <div key={idx} className="text-center">
              <div className="border-b-2 border-black pb-8 mb-4">&nbsp;</div>
              <p className="font-bold">{role}</p>
              <p className="text-sm text-gray-600">
                {role === 'DENUNCIANTE' ? 'Nombre y Apellido' : 'Nombre, Apellido y Grado'}
              </p>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600">
          Documento oficial de registro de incidente - Powervision
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Generado el{' '}
          {format(new Date(), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
        </p>
      </footer>
    </article>
  );
}