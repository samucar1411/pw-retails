'use client';

import { useMemo } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { getIncidents } from '@/services/incident-service';
import { getAllOfficesComplete } from '@/services/office-service';
import { getIncidentTypes } from '@/services/incident-service';
import { getSuspectStatuses } from '@/services/suspect-service';
import { Incident } from '@/types/incident';
import { Office } from '@/types/office';

interface DashboardSmartConfig {
  maxPages?: number;
  pageSize?: number;
  enableParallelLoading?: boolean;
}

const DEFAULT_CONFIG: DashboardSmartConfig = {
  maxPages: 10,           // Máximo 10 páginas (1000 incidentes)
  pageSize: 100,          // 100 incidentes por página
  enableParallelLoading: true,
};

export function useDashboardSmart(
  fromDate: string = '',
  toDate: string = '',
  officeId: string = '',
  config: DashboardSmartConfig = DEFAULT_CONFIG
) {
  // 1. Cargar primera página inmediatamente (UX rápida)
  const firstPageQuery = useQuery({
    queryKey: ['incidents-smart-first', fromDate, toDate, officeId, config.pageSize],
    queryFn: async () => {
      const response = await getIncidents({ 
        page: 1, 
        page_size: config.pageSize || 100,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        officeId: officeId || undefined,
        ordering: '-Date', // Más recientes primero
      });
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 min cache para primera página
    refetchOnWindowFocus: false,
  });
  
  // 2. Determinar cuántas páginas cargar basado en el total
  const totalPages = useMemo(() => {
    if (!firstPageQuery.data?.count || !config.pageSize) return 0;
    const calculated = Math.ceil(firstPageQuery.data.count / config.pageSize);
    const limited = Math.min(calculated, config.maxPages || 10);
    return limited;
  }, [firstPageQuery.data?.count, config.pageSize, config.maxPages]);
    
  // 3. Cargar páginas adicionales solo si es necesario y están habilitadas
  const additionalPagesQueries = useQueries({
    queries: (totalPages > 1 && config.enableParallelLoading)
      ? Array.from({ length: totalPages - 1 }, (_, i) => ({
          queryKey: ['incidents-smart-additional', fromDate, toDate, officeId, i + 2, config.pageSize],
          queryFn: async () => {
            const pageNum = i + 2;
            const response = await getIncidents({
              page: pageNum,
              page_size: config.pageSize || 100,
              fromDate: fromDate || undefined,
              toDate: toDate || undefined,
              officeId: officeId || undefined,
              ordering: '-Date',
            });
            return response;
          },
          enabled: !!firstPageQuery.data && totalPages > 1,
          staleTime: 1000 * 60 * 10, // 10 min cache para páginas adicionales
          refetchOnWindowFocus: false,
        }))
      : []
  });

  // 4. Cargar datos de referencia (cacheo agresivo)
  const officesQuery = useQuery({
    queryKey: ['offices-smart-reference'],
    queryFn: getAllOfficesComplete,
    staleTime: 1000 * 60 * 30, // 30 min cache
    refetchOnWindowFocus: false,
  });

  const incidentTypesQuery = useQuery({
    queryKey: ['incident-types-smart-reference'],
    queryFn: getIncidentTypes,
    staleTime: 1000 * 60 * 30, // 30 min cache
    refetchOnWindowFocus: false,
  });

  const suspectStatusesQuery = useQuery({
    queryKey: ['suspect-statuses-smart-reference'],
    queryFn: getSuspectStatuses,
    staleTime: 1000 * 60 * 30, // 30 min cache
    refetchOnWindowFocus: false,
  });
  
  // 5. Combinar datos inteligentemente
  const combinedData = useMemo(() => {
    const incidents: Incident[] = firstPageQuery.data?.results || [];
    
    // Agregar páginas adicionales si están disponibles
    additionalPagesQueries.forEach((query, index) => {
      if (query.data?.results) {
        incidents.push(...query.data.results);
      }
    });

    // Estadísticas
    const totalCount = firstPageQuery.data?.count || 0;
    const loadedCount = incidents.length;
    const pagesLoaded = 1 + additionalPagesQueries.filter(q => q.data).length;
    const isLoadingMore = additionalPagesQueries.some(q => q.isLoading);
    const memoryUsageMB = parseFloat((JSON.stringify(incidents).length / 1024 / 1024).toFixed(2));
    
    // Create lookup maps for performance
    const offices = officesQuery.data || [];
    const incidentTypes = incidentTypesQuery.data?.results || [];
    const suspectStatuses = suspectStatusesQuery.data || [];
    
    const officeMap = new Map(offices.map(o => [o.id.toString(), o]));
    const typeMap = new Map(incidentTypes.map(t => [t.id, t]));
    const statusMap = new Map(suspectStatuses.map(s => [s.id, s]));

    // Helper functions for fast lookups
    const getOfficeById = (id: string | number) => officeMap.get(id.toString());
    const getIncidentTypeById = (id: number) => typeMap.get(id);
    const getSuspectStatusById = (id: number) => statusMap.get(id);

    // Suspect statistics from loaded incidents
    const allSuspectIds = new Set<string>();
    incidents.forEach(incident => {
      if (incident.Suspects && Array.isArray(incident.Suspects)) {
        incident.Suspects.forEach(suspectId => {
          if (suspectId && suspectId.trim()) {
            allSuspectIds.add(suspectId);
          }
        });
      }
    });

    return {
      // Core data
      incidents,
      offices,
      incidentTypes,
      suspectStatuses,
      
      // Stats
      totalCount,
      loadedCount,
      pagesLoaded,
      totalPages,
      memoryUsageMB,
      
      // Performance indicators
      isLoadingMore,
      isComplete: pagesLoaded >= totalPages,
      loadingProgress: totalPages > 0 ? (pagesLoaded / totalPages) * 100 : 100,
      
      // Helper functions
      getOfficeById,
      getIncidentTypeById,
      getSuspectStatusById,
      
      // Computed stats
      uniqueSupspectsCount: allSuspectIds.size,
    };
  }, [
    firstPageQuery.data,
    additionalPagesQueries,
    totalPages,
    officesQuery.data,
    incidentTypesQuery.data,
    suspectStatusesQuery.data,
  ]);
  
  return {
    ...combinedData,
    isLoading: firstPageQuery.isLoading,
    error: firstPageQuery.error || officesQuery.error || incidentTypesQuery.error || suspectStatusesQuery.error,
    refetch: firstPageQuery.refetch,
  };
}

// Hook específico para componentes que necesitan datos filtrados client-side
export function useSmartFilteredData(
  fromDate: string = '',
  toDate: string = '',
  officeId: string = '',
  config?: DashboardSmartConfig
) {
  const smartData = useDashboardSmart(fromDate, toDate, officeId, config);
  
  // Ya están filtrados por el servidor, pero podemos hacer filtrado adicional si es necesario
  const clientFilteredData = useMemo(() => {
    if (!smartData.incidents) return null;
    
    // Los datos ya vienen filtrados del servidor, pero podemos aplicar filtros adicionales aquí
    let filtered = smartData.incidents;
    
    // Ejemplo de filtro adicional client-side si es necesario
    // filtered = filtered.filter(incident => /* algún criterio adicional */);
    
    return {
      ...smartData,
      incidents: filtered,
      filteredCount: filtered.length,
    };
  }, [smartData]);
  
  return clientFilteredData;
}