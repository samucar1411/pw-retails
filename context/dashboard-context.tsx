'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useDashboardSmart } from '@/hooks/useDashboardSmart';
import { getAllSuspects } from '@/services/suspect-service';
import { Incident } from '@/types/incident';
import { Suspect, SuspectStatus } from '@/types/suspect';
import { Office } from '@/types/office';
import { IncidentType } from '@/types/incident';

// Tipos para los datos del dashboard
interface DashboardData {
  incidents: {
    total: number;
    recent: Incident[];
    distribution: Incident[];
    economic: Incident[];
    allIncidents: Incident[]; // Para la página de incidentes
  };
  suspects: {
    identified: number;
    notIdentified: number;
    topRepeat: Suspect[];
    allSuspects: Suspect[]; // Para la página de sospechosos
  };
  offices: {
    branches24h: number;
    ranking: Office[];
    allOffices: Office[]; // Para filtros
  };
  historical: Incident[];
  // Datos adicionales para otras páginas
  suspectStatuses: SuspectStatus[]; // Estados de sospechosos
  incidentTypes: IncidentType[]; // Tipos de incidentes
}

interface DashboardFilters {
  fromDate: string;
  toDate: string;
  officeId: string;
}

interface DashboardContextType {
  data: DashboardData;
  filters: DashboardFilters;
  isLoading: boolean;
  error: Error | null;
  setFilters: (filters: DashboardFilters) => void;
  refreshData: () => void;
  isInitialized: boolean;
  // Smart dashboard metrics
  smartMetrics?: {
    totalCount: number;
    loadedCount: number;
    pagesLoaded: number;
    totalPages: number;
    memoryUsageMB: number;
    isLoadingMore: boolean;
    isComplete: boolean;
    loadingProgress: number;
  };
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Datos iniciales vacíos
const initialData: DashboardData = {
  incidents: {
    total: 0,
    recent: [],
    distribution: [],
    economic: [],
    allIncidents: []
  },
  suspects: {
    identified: 0,
    notIdentified: 0,
    topRepeat: [],
    allSuspects: []
  },
  offices: {
    branches24h: 0,
    ranking: [],
    allOffices: []
  },
  historical: [],
  suspectStatuses: [],
  incidentTypes: []
};

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<DashboardFilters>({
    fromDate: '',
    toDate: '',
    officeId: ''
  });
  
  // Use smart dashboard hook for optimized loading
  const smartData = useDashboardSmart(
    filters.fromDate,
    filters.toDate, 
    filters.officeId,
    {
      maxPages: 15,      // Load up to 15 pages (1500 incidents)  
      pageSize: 100,     // 100 incidents per page
      enableParallelLoading: true
    }
  );

  // Load additional suspect data (not covered by smart hook)
  const loadSupplementaryData = useCallback(async () => {
    try {
      const suspects = await getAllSuspects({
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        officeId: filters.officeId
      });
      
      return {
        allSuspects: suspects?.results || [],
        identified: suspects?.results?.filter((s: Suspect) => s.Status === 2)?.length || 0,
        notIdentified: suspects?.results?.filter((s: Suspect) => s.Status === 1)?.length || 0,
      };
    } catch (error) {
      console.warn('Error loading suspects:', error);
      return {
        allSuspects: [],
        identified: 0,
        notIdentified: 0,
      };
    }
  }, [filters]);

  // Compute dashboard data from smart hook
  const [supplementaryData, setSupplementaryData] = useState<{
    allSuspects: Suspect[];
    identified: number;
    notIdentified: number;
  }>({
    allSuspects: [],
    identified: 0,
    notIdentified: 0,
  });

  // Load supplementary data when filters change
  React.useEffect(() => {
    loadSupplementaryData().then(setSupplementaryData);
  }, [loadSupplementaryData]);

  // Compute final dashboard data
  const data: DashboardData = React.useMemo(() => {
    const incidents = smartData.incidents || [];
    const offices = smartData.offices || [];
    
    return {
      incidents: {
        total: smartData.totalCount || 0,
        recent: incidents.slice(0, 10), // Most recent 10
        distribution: incidents,
        economic: incidents.filter(i => i.IncidentType === 1), // Economic crimes
        allIncidents: incidents
      },
      suspects: {
        identified: supplementaryData.identified,
        notIdentified: supplementaryData.notIdentified,
        topRepeat: supplementaryData.allSuspects.slice(0, 10), // Top 10
        allSuspects: supplementaryData.allSuspects
      },
      offices: {
        branches24h: offices.length,
        ranking: offices,
        allOffices: offices
      },
      historical: incidents,
      suspectStatuses: smartData.suspectStatuses || [],
      incidentTypes: smartData.incidentTypes || []
    };
  }, [smartData, supplementaryData]);

  // Refresh function
  const refreshData = useCallback(() => {
    smartData.refetch?.();
    loadSupplementaryData().then(setSupplementaryData);
  }, [smartData.refetch, loadSupplementaryData]);

  // Function to update filters
  const handleSetFilters = useCallback((newFilters: DashboardFilters) => {
    setFilters(newFilters);
  }, []);

  // Smart metrics for monitoring
  const smartMetrics = {
    totalCount: smartData.totalCount || 0,
    loadedCount: smartData.loadedCount || 0,
    pagesLoaded: smartData.pagesLoaded || 0,
    totalPages: smartData.totalPages || 0,
    memoryUsageMB: smartData.memoryUsageMB || 0,
    isLoadingMore: smartData.isLoadingMore || false,
    isComplete: smartData.isComplete || false,
    loadingProgress: smartData.loadingProgress || 0,
  };

  const value: DashboardContextType = {
    data,
    filters,
    isLoading: smartData.isLoading || false,
    error: smartData.error || null,
    setFilters: handleSetFilters,
    refreshData,
    isInitialized: !smartData.isLoading,
    smartMetrics
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

// Hook específico para obtener datos del dashboard
export function useDashboardData() {
  const { data, isLoading, error } = useDashboard();
  return { data, isLoading, error };
}

// Hook para obtener filtros del dashboard
export function useDashboardFilters() {
  const { filters, setFilters } = useDashboard();
  return { filters, setFilters };
}

// Hook específico para la página de sospechosos
export function useSuspectsData() {
  const { data, isLoading, error } = useDashboard();
  return {
    suspects: data.suspects.allSuspects,
    suspectStatuses: data.suspectStatuses,
    offices: data.offices.allOffices,
    isLoading,
    error
  };
}

// Hook específico para la página de incidentes
export function useIncidentsData() {
  const { data, isLoading, error } = useDashboard();
  return {
    incidents: data.incidents.allIncidents,
    incidentTypes: data.incidentTypes,
    offices: data.offices.allOffices,
    isLoading,
    error
  };
}

// Hook para obtener datos de filtros comunes
export function useCommonFilterData() {
  const { data, isLoading, error } = useDashboard();
  return {
    offices: data.offices.allOffices,
    suspectStatuses: data.suspectStatuses,
    incidentTypes: data.incidentTypes,
    isLoading,
    error
  };
} 