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
  const id = typeof office === 'string' ? parseInt(office, 10) : office;
  return `Oficina ${id}`;
};

const getIncidentTypeName = (typeId: number, types: Array<{ id: number; name: string }>) => {
  const type = types.find(t => t.id === typeId);
  return type ? type.name : `Tipo ${typeId}`;
};

export function PoliceReportPreview({
  incidentData,
  suspects = [],
  incidentTypes = [],
  office = null,
  companyName = '',
  companyLogo = null,
}: PoliceReportPreviewProps) {
  if (!incidentData) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-8 text-center">
        <p className="text-gray-500">No hay datos de incidente para mostrar</p>
      </div>
    );
  }

  // Simple date formatting with fallback
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

  const generationDateTime = format(new Date(), 'dd/MM/yyyy - HH:mm', { locale: es });
  const formattedDateTime = formatDateTime();

  return (
    <article className="max-w-5xl mx-auto bg-white text-gray-800 p-8 print:p-6">
      {/* Header */}
      <header className="border-b-4 border-black p-8 mb-10 print:p-6 print:mb-8">
        <div className="flex items-center justify-between mb-8">
          {/* Company Logo */}
          <div className="flex items-center">
            {companyLogo ? (
              <Image
                src={companyLogo}
                alt={companyName || 'Company Logo'}
                width={80}
                height={80}
                className="object-contain w-20 h-20"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="w-20 h-20 bg-gray-200 rounded flex items-center justify-center"><span class="text-sm text-gray-500">Logo</span></div>';
                  }
                }}
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-sm text-gray-500">Logo</span>
              </div>
            )}
            {companyName && (
              <div className="ml-6">
                <p className="text-xl font-bold text-gray-800">{companyName}</p>
                <p className="text-sm text-gray-600">Empresa</p>
              </div>
            )}
          </div>
          
          {/* Powervision Logo */}
          <div className="flex items-center">
            <div className="text-right mr-4">
              <p className="text-sm text-gray-600">Generado por</p>
            </div>
            <Image
              src="/logo-dark.png"
              alt="Powervision"
              width={120}
              height={40}
              className="object-contain w-30 h-10"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="w-30 h-10 bg-gray-200 rounded flex items-center justify-center"><span class="text-sm text-gray-500">Powervision</span></div>';
                }
              }}
            />
          </div>
        </div>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold uppercase mb-3 text-black">
            Informe de Incidente N° {String(incidentData.id).padStart(6, '0')}
          </h1>
          <p className="text-lg font-semibold text-gray-700">
            Fecha de generación: {generationDateTime}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="space-y-10">
        {/* 1. Datos del incidente */}
        <section className="bg-gray-50 border border-gray-300 rounded-lg p-6">
          <h2 className="text-2xl font-bold border-b-2 border-black mb-6 pb-2">1. Datos del incidente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="font-bold">ID del Incidente:</p>
              <p className="text-lg">#{incidentData.id}</p>
            </div>
            <div>
              <p className="font-bold">Fecha y Hora:</p>
              <p>{formattedDateTime}</p>
            </div>
            <div>
              <p className="font-bold">Empresa:</p>
              <p>{companyName || 'No especificada'}</p>
            </div>
            <div>
              <p className="font-bold">Sucursal:</p>
              <p>{office ? getBranchName(office) : 'No especificada'}</p>
            </div>
            <div>
              <p className="font-bold">Tipo de Incidente:</p>
              <p>{getIncidentTypeName(incidentData.IncidentType, incidentTypes)}</p>
            </div>
            {office?.Address && (
              <div>
                <p className="font-bold">Dirección:</p>
                <p>{office.Address}</p>
              </div>
            )}
          </div>
        </section>

        {/* 2. Descripción */}
        <section className="bg-white border border-gray-300 rounded-lg p-6">
          <h2 className="text-2xl font-bold border-b-2 border-black mb-6 pb-2">2. Descripción del incidente</h2>
          {incidentData.Description && incidentData.Description.trim() !== '' ? (
            <div className="bg-gray-50 border-2 border-gray-300 p-6 rounded-lg">
              <p className="whitespace-pre-line text-gray-800 leading-relaxed">
                {incidentData.Description}
              </p>
            </div>
          ) : (
            <div className="bg-gray-100 border-2 border-gray-300 p-6 rounded-lg text-center">
              <p className="text-gray-500 italic">No se proporcionó descripción del incidente</p>
            </div>
          )}
        </section>

        {/* 3. Pérdidas */}
        <section className="bg-white border border-gray-300 rounded-lg p-6">
          <h2 className="text-2xl font-bold border-b-2 border-black mb-6 pb-2">3. Pérdidas reportadas</h2>
          
          {/* Efectivo */}
          <div className="mb-8">
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-4 text-center">Efectivo</h3>
              <p className="text-xl text-red-600 text-center font-semibold">
                ₲{(parseFloat(incidentData.CashLoss || '0') || 0).toLocaleString('es-PY')}
              </p>
            </div>
          </div>

          {/* Mercancía con breakdown */}
          <div className="mb-8">
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-4 text-center">Mercancía</h3>
              {incidentData.incidentLossItem && incidentData.incidentLossItem.filter(item => item.type === 'mercaderia').length > 0 ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 bg-white">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Descripción</th>
                          <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Cantidad</th>
                          <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Precio Unitario</th>
                          <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {incidentData.incidentLossItem
                          .filter(item => item.type === 'mercaderia')
                          .map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                              <td className="border border-gray-300 px-4 py-2 text-right">₲{item.unitPrice.toLocaleString('es-PY')}</td>
                              <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-red-600">₲{item.total.toLocaleString('es-PY')}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="text-center mt-4 pt-4 border-t border-red-200">
                    <p className="text-xl text-red-600 font-semibold">
                      Total Mercancía: ₲{(parseFloat(incidentData.MerchandiseLoss || '0') || 0).toLocaleString('es-PY')}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xl text-red-600 text-center font-semibold">
                  ₲{(parseFloat(incidentData.MerchandiseLoss || '0') || 0).toLocaleString('es-PY')}
                </p>
              )}
            </div>
          </div>

          {/* Otros daños con breakdown */}
          <div className="mb-8">
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-4 text-center">Otros daños</h3>
              {incidentData.incidentLossItem && incidentData.incidentLossItem.filter(item => item.type === 'material').length > 0 ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 bg-white">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Descripción</th>
                          <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Cantidad</th>
                          <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Precio Unitario</th>
                          <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {incidentData.incidentLossItem
                          .filter(item => item.type === 'material')
                          .map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                              <td className="border border-gray-300 px-4 py-2 text-right">₲{item.unitPrice.toLocaleString('es-PY')}</td>
                              <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-red-600">₲{item.total.toLocaleString('es-PY')}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="text-center mt-4 pt-4 border-t border-red-200">
                    <p className="text-xl text-red-600 font-semibold">
                      Total Otros daños: ₲{(parseFloat(incidentData.OtherLosses || '0') || 0).toLocaleString('es-PY')}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xl text-red-600 text-center font-semibold">
                  ₲{(parseFloat(incidentData.OtherLosses || '0') || 0).toLocaleString('es-PY')}
                </p>
              )}
            </div>
          </div>

          {/* Total general */}
          <div className="bg-red-100 border-2 border-red-300 p-6 rounded-lg text-center">
            <p className="font-bold text-xl mb-2">Total estimado:</p>
            <p className="text-2xl font-bold text-red-700">
              ₲{(parseFloat(incidentData.TotalLoss || '0') || 
                (parseFloat(incidentData.CashLoss || '0') || 0) + 
                (parseFloat(incidentData.MerchandiseLoss || '0') || 0) + 
                (parseFloat(incidentData.OtherLosses || '0') || 0)
              ).toLocaleString('es-PY')}
            </p>
          </div>
        </section>

        {/* 4. Sospechosos */}
        {suspects && suspects.length > 0 && (
          <section className="bg-white border border-gray-300 rounded-lg p-6">
            <h2 className="text-2xl font-bold border-b-2 border-black mb-6 pb-2">4. Información de sospechosos</h2>
            <div className="space-y-6">
              {suspects.map((suspect, index) => (
                <div key={suspect.id || index} className="border-2 border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
                  {/* Header con número y estado */}
                  <div className="bg-gray-100 px-6 py-4 border-b border-gray-300">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">
                        SOSPECHOSO #{index + 1}
                      </h3>
                      <div className="px-3 py-1 rounded-full text-sm font-semibold ${
                        suspect.Status === 1 ? 'bg-red-100 text-red-800' :
                        suspect.Status === 2 ? 'bg-yellow-100 text-yellow-800' :
                        suspect.Status === 3 ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }">
                        {suspect.Status === 1 ? 'Detenido' : suspect.Status === 2 ? 'Libre' : suspect.Status === 3 ? 'Preso' : 'Desconocido'}
                      </div>                     
                    </div>
                  </div>
                  
                  {/* Contenido principal */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Columna 1: Foto */}
                      <div className="lg:col-span-1">
                        <h4 className="font-semibold text-gray-900 mb-3 text-sm">FOTOGRAFÍA</h4>
                        <div className="flex justify-center">
                          <div className="w-32 h-40 border-2 border-gray-300 bg-white overflow-hidden rounded-lg">
                            {suspect.PhotoUrl ? (
                              <Image 
                                src={suspect.PhotoUrl}
                                alt={`Foto de ${suspect.Alias}`}
                                width={128}
                                height={160}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
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
                      <div className="lg:col-span-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Información personal */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 text-sm border-b border-gray-200 pb-1">
                              INFORMACIÓN PERSONAL
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex">
                                <span className="font-medium text-gray-600 w-20">Alias:</span>
                                <span className="text-gray-900 font-semibold">{suspect.Alias || 'No especificado'}</span>
                              </div>
                              <div className="flex">
                                <span className="font-medium text-gray-600 w-20">ID:</span>
                                <span className="text-gray-900 font-mono">{suspect.id}</span>
                              </div>
                              {suspect.IncidentsCount !== undefined && (
                                <div className="flex">
                                  <span className="font-medium text-gray-600 w-20">Incidentes:</span>
                                  <span className="text-gray-900">{suspect.IncidentsCount}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Descripción física */}
                        {suspect.PhysicalDescription && (
                          <div className="mt-6">
                            <h4 className="font-semibold text-gray-900 mb-3 text-sm border-b border-gray-200 pb-1">
                              DESCRIPCIÓN FÍSICA
                            </h4>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-white p-4 rounded border">
                              {suspect.PhysicalDescription}
                            </p>
                          </div>
                        )}

                        {/* Tags/Características */}
                        {suspect.Tags && Object.keys(suspect.Tags).length > 0 && (
                          <div className="mt-6">
                            <h4 className="font-semibold text-gray-900 mb-4 text-sm border-b border-gray-200 pb-1">
                              CARACTERÍSTICAS DISTINTIVAS
                            </h4>
                            <div className="bg-white border rounded-lg p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Género */}
                                {suspect.Tags.sexo && (
                                  <div>
                                    <h6 className="text-xs font-medium text-gray-600 mb-1">Género</h6>
                                    <p className="text-sm capitalize">
                                      {suspect.Tags.sexo === 'masculino' ? 'Hombre' : 
                                       suspect.Tags.sexo === 'femenino' ? 'Mujer' : 
                                       suspect.Tags.sexo === 'desconocido' ? 'Desconocido' : suspect.Tags.sexo}
                                    </p>
                                  </div>
                                )}
                                
                                {/* Contextura */}
                                {suspect.Tags.contextura && (
                                  <div>
                                    <h6 className="text-xs font-medium text-gray-600 mb-1">Contextura</h6>
                                    <p className="text-sm capitalize">{suspect.Tags.contextura}</p>
                                  </div>
                                )}
                                
                                {/* Estatura */}
                                {suspect.Tags.altura && (
                                  <div>
                                    <h6 className="text-xs font-medium text-gray-600 mb-1">Estatura</h6>
                                    <p className="text-sm">
                                      {(() => {
                                        switch(suspect.Tags.altura) {
                                          case 'bajo': return 'Bajo (<1.60m)';
                                          case 'normal': return 'Normal (1.60m-1.75m)';
                                          case 'alto': return 'Alto (1.76m-1.85m)';
                                          case 'muy_alto': return 'Muy Alto (>1.85m)';
                                          default: return suspect.Tags.altura;
                                        }
                                      })()} 
                                    </p>
                                  </div>
                                )}
                                
                                {/* Tono de piel */}
                                {suspect.Tags.piel && (
                                  <div>
                                    <h6 className="text-xs font-medium text-gray-600 mb-1">Tono de piel</h6>
                                    <p className="text-sm capitalize">{suspect.Tags.piel}</p>
                                  </div>
                                )}
                                
                                {/* Piercings */}
                                {suspect.Tags.piercings && (
                                  <div>
                                    <h6 className="text-xs font-medium text-gray-600 mb-1">Piercings</h6>
                                    <p className="text-sm capitalize">
                                      {suspect.Tags.piercings.split ? suspect.Tags.piercings.split(',').map((p: string) => p.trim()).join(', ') : suspect.Tags.piercings}
                                    </p>
                                  </div>
                                )}
                                
                                {/* Tatuajes */}
                                {suspect.Tags.tatuajes && (
                                  <div>
                                    <h6 className="text-xs font-medium text-gray-600 mb-1">Tatuajes</h6>
                                    <p className="text-sm capitalize">
                                      {suspect.Tags.tatuajes.split ? suspect.Tags.tatuajes.split(',').map((t: string) => t.trim()).join(', ') : suspect.Tags.tatuajes}
                                    </p>
                                  </div>
                                )}
                                
                                {/* Accesorios */}
                                {suspect.Tags.accesorios && (
                                  <div>
                                    <h6 className="text-xs font-medium text-gray-600 mb-1">Accesorios</h6>
                                    <p className="text-sm capitalize">
                                      {suspect.Tags.accesorios.split ? suspect.Tags.accesorios.split(',').map((a: string) => a.trim().replace('_', ' ')).join(', ') : suspect.Tags.accesorios}
                                    </p>
                                  </div>
                                )}
                                
                                {/* Comportamiento */}
                                {suspect.Tags.comportamiento && (
                                  <div>
                                    <h6 className="text-xs font-medium text-gray-600 mb-1">Comportamiento</h6>
                                    <p className="text-sm capitalize">
                                      {suspect.Tags.comportamiento.split ? suspect.Tags.comportamiento.split(',').map((c: string) => c.trim()).join(', ') : suspect.Tags.comportamiento}
                                    </p>
                                  </div>
                                )}
                                
                                {/* Transporte */}
                                {suspect.Tags.transporte && (
                                  <div>
                                    <h6 className="text-xs font-medium text-gray-600 mb-1">Transporte</h6>
                                    <p className="text-sm capitalize">{suspect.Tags.transporte.replace('_', ' ')}</p>
                                  </div>
                                )}
                                
                                {/* Placa del vehículo */}
                                {suspect.Tags.placa && (
                                  <div>
                                    <h6 className="text-xs font-medium text-gray-600 mb-1">Placa del vehículo</h6>
                                    <p className="text-sm font-mono">{suspect.Tags.placa}</p>
                                  </div>
                                )}
                                
                                {/* Elementos que dificultan identificación */}
                                {suspect.Tags.dificulta_identificacion && (
                                  <div>
                                    <h6 className="text-xs font-medium text-gray-600 mb-1">Dificulta identificación</h6>
                                    <p className="text-sm capitalize">
                                      {suspect.Tags.dificulta_identificacion.split ? suspect.Tags.dificulta_identificacion.split(',').map((d: string) => d.trim()).join(', ') : suspect.Tags.dificulta_identificacion}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Última vez visto */}
                        {suspect.LastSeen && (
                          <div className="mt-6">
                            <h4 className="font-semibold text-gray-900 mb-2 text-sm border-b border-gray-200 pb-1">
                              ÚLTIMA VEZ VISTO
                            </h4>
                            <p className="text-sm text-gray-700">
                              {format(new Date(suspect.LastSeen), "d 'de' MMMM 'de' yyyy", { locale: es })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black mt-12 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="text-center">
            <div className="border-b-2 border-black h-16 mb-4"></div>
            <p className="font-bold">DENUNCIANTE</p>
            <p className="text-sm">Nombre y Apellido</p>
          </div>
          <div className="text-center">
            <div className="border-b-2 border-black h-16 mb-4"></div>
            <p className="font-bold">OFICIAL DE POLICÍA</p>
            <p className="text-sm">Nombre, Apellido y Grado</p>
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-600">
          <p>Documento oficial de registro de incidente - Powervision</p>
          <p>Generado el {generationDateTime}</p>
        </div>
      </footer>
    </article>
  );
}