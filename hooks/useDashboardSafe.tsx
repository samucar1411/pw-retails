'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getIncidents } from '@/services/incident-service';
import { getAllOfficesComplete } from '@/services/office-service';
import { getIncidentTypes } from '@/services/incident-service';

interface DashboardSafeConfig {
  maxIncidents?: number;
  maxAgeMonths?: number;
  enableAgressiveCaching?: boolean;
}

const DEFAULT_CONFIG: DashboardSafeConfig = {
  maxIncidents: 2000,        // Límite hard de incidentes
  maxAgeMonths: 6,          // Solo últimos 6 meses
  enableAgressiveCaching: true,
};

export function useDashboardSafe(
  fromDate?: string,
  toDate?: string, 
  officeId?: string,
  config: DashboardSafeConfig = DEFAULT_CONFIG
) {
  
  // Calcular fechas límite para evitar cargas masivas
  const safeDateRange = useMemo(() => {
    const now = new Date();
    const maxAgeDate = new Date();
    maxAgeDate.setMonth(now.getMonth() - (config.maxAgeMonths || 6));
    
    const safeFromDate = fromDate && fromDate > maxAgeDate.toISOString().split('T')[0] 
      ? fromDate 
      : maxAgeDate.toISOString().split('T')[0];
      
    const safeToDate = toDate || now.toISOString().split('T')[0];
    
    return { safeFromDate, safeToDate };
  }, [fromDate, toDate, config.maxAgeMonths]);

  // Query con límites de seguridad
  const incidentsQuery = useQuery({
    queryKey: [
      'dashboard-incidents-safe', 
      safeDateRange.safeFromDate, 
      safeDateRange.safeToDate, 
      officeId,
      config.maxIncidents
    ],
    queryFn: async () => {
      
      const response = await getIncidents({
        page: 1,
        page_size: config.maxIncidents,
        fromDate: safeDateRange.safeFromDate,
        toDate: safeDateRange.safeToDate,
        officeId: officeId || undefined,
        // Ordenar por fecha desc para tener los más recientes
        ordering: '-Date',
      });
      
      
      return response;
    },
    staleTime: config.enableAgressiveCaching ? 1000 * 60 * 15 : 1000 * 60 * 5, // 15min vs 5min
    gcTime: 1000 * 60 * 30, // Limpiar después de 30min inactivo
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: true,
  });

  // Datos de referencia (estos sí se pueden cachear agresivamente)
  const officesQuery = useQuery({
    queryKey: ['offices-reference'],
    queryFn: getAllOfficesComplete,
    staleTime: 1000 * 60 * 60, // 1 hora - datos estables
    gcTime: 1000 * 60 * 120,   // 2 horas en memoria
    refetchOnWindowFocus: false,
  });

  const incidentTypesQuery = useQuery({
    queryKey: ['incident-types-reference'],
    queryFn: getIncidentTypes,
    staleTime: 1000 * 60 * 60, // 1 hora - datos estables
    gcTime: 1000 * 60 * 120,   // 2 horas en memoria  
    refetchOnWindowFocus: false,
  });

  // Funciones computadas optimizadas
  const computedData = useMemo(() => {
    const incidents = incidentsQuery.data?.results || [];
    const offices = officesQuery.data || [];
    const incidentTypes = incidentTypesQuery.data?.results || [];
    
    // Crear maps para lookups O(1)
    const officeMap = new Map(offices.map(o => [o.id.toString(), o]));
    const typeMap = new Map(incidentTypes.map(t => [t.id, t]));
    
    // Stats básicas
    const totalIncidents = incidents.length;
    const uniqueSuspects = new Set(
      incidents.flatMap(i => i.Suspects || []).filter(Boolean)
    ).size;
    
    // Warning si llegamos al límite
    const isLimitReached = totalIncidents >= (config.maxIncidents || 2000);
    
    return {
      incidents,
      offices,
      incidentTypes,
      officeMap,
      typeMap,
      stats: {
        totalIncidents,
        uniqueSuspects,
        isLimitReached,
        memoryUsageMB: parseFloat((JSON.stringify(incidents).length / 1024 / 1024).toFixed(2)),
      }
    };
  }, [incidentsQuery.data, officesQuery.data, incidentTypesQuery.data, config.maxIncidents]);

  return {
    ...computedData,
    isLoading: incidentsQuery.isLoading || officesQuery.isLoading || incidentTypesQuery.isLoading,
    error: incidentsQuery.error || officesQuery.error || incidentTypesQuery.error,
    refetch: incidentsQuery.refetch,
  };
}

// Hook para componentes que necesitan warnings de memoria
export function useMemoryMonitor() {
  return useMemo(() => {
    if (typeof window === 'undefined') return null;
    
    // Estimar memoria usada (aproximado)
    const memoryInfo = (performance as any).memory;
    if (!memoryInfo) return null;
    
    const usedMB = memoryInfo.usedJSHeapSize / 1024 / 1024;
    const limitMB = memoryInfo.jsHeapSizeLimit / 1024 / 1024;
    const percentage = (usedMB / limitMB) * 100;
    
    return {
      usedMB: Math.round(usedMB),
      limitMB: Math.round(limitMB),
      percentage: Math.round(percentage),
      isHigh: percentage > 70, // Warning si > 70%
      isCritical: percentage > 85, // Critical si > 85%
    };
  }, []);
}