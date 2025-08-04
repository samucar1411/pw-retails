'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAllSuspects } from '@/services/suspect-service';
import { getIncidents } from '@/services/incident-service';
import { getAllOfficesComplete } from '@/services/office-service';
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
  const [data, setData] = useState<DashboardData>(initialData);
  const [filters, setFilters] = useState<DashboardFilters>({
    fromDate: '',
    toDate: '',
    officeId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Función para cargar todos los datos del dashboard
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const newData: DashboardData = { ...initialData };

      // 1. Cargar incidentes recientes
      const recentIncidents = await getIncidents({
        page: 1,
        page_size: 10,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        officeId: filters.officeId
      });
      newData.incidents.recent = recentIncidents?.results || [];
      newData.incidents.total = recentIncidents?.count || 0;

      // 2. Cargar todos los incidentes (para la página de incidentes)
      const allIncidents = await getIncidents({
        page: 1,
        page_size: 100, // Más incidentes para la página de incidentes
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        officeId: filters.officeId
      });
      newData.incidents.allIncidents = allIncidents?.results || [];

      // 3. Cargar sospechosos
      const suspects = await getAllSuspects({
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        officeId: filters.officeId
      });
      
      // Calcular estadísticas de sospechosos
      const identified = suspects?.results?.filter((s: Suspect) => s.Status === 2)?.length || 0;
      const notIdentified = suspects?.results?.filter((s: Suspect) => s.Status === 1)?.length || 0;
      
      newData.suspects.identified = identified;
      newData.suspects.notIdentified = notIdentified;
      newData.suspects.allSuspects = suspects?.results || [];

      // 4. Cargar oficinas
      const offices = await getAllOfficesComplete();
      newData.offices.branches24h = offices?.length || 0;
      newData.offices.ranking = offices || [];
      newData.offices.allOffices = offices || [];

      // 5. Cargar estados de sospechosos
      try {
        const suspectStatuses = await import('@/services/suspect-service').then(module => 
          module.getSuspectStatuses()
        );
        newData.suspectStatuses = suspectStatuses;
      } catch (error) {
        console.warn('Error loading suspect statuses:', error);
        newData.suspectStatuses = [];
      }

      // 6. Cargar tipos de incidentes
      try {
        const incidentTypes = await import('@/services/incident-service').then(module => 
          module.getIncidentTypes()
        );
        newData.incidentTypes = incidentTypes.results || [];
      } catch (error) {
        console.warn('Error loading incident types:', error);
        newData.incidentTypes = [];
      }

      // 7. Cargar datos históricos (placeholder)
      newData.historical = [];

      setData(newData);
      setIsInitialized(true);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Cargar datos cuando cambian los filtros
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Función para refrescar datos
  const refreshData = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Función para actualizar filtros
  const handleSetFilters = useCallback((newFilters: DashboardFilters) => {
    setFilters(newFilters);
  }, []);

  const value: DashboardContextType = {
    data,
    filters,
    isLoading,
    error,
    setFilters: handleSetFilters,
    refreshData,
    isInitialized
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