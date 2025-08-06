import { useState, useEffect, useCallback } from 'react';
import { Incident } from '@/types/incident';
import { getIncidents, getIncidentTypes } from '@/services/incident-service';
import { getOffices } from '@/services/office-service';
import { getAllSuspects } from '@/services/suspect-service';

interface IncidentFilters {
  Office?: string;
  IncidentType?: string | number;
  suspect_alias?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  page?: number;
  page_size?: number;
  id?: string;
  ordering?: string;
}

export interface UseIncidentsWithFiltersReturn {
  incidents: Incident[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  filterOptions: {
    offices: Array<{ id: string; name: string }>;
    incidentTypes: Array<{ id: string; Name: string }>;
    suspects: Array<{ alias: string }>;
  };
  refreshIncidents: () => Promise<void>;
  applyFilters: (filters: IncidentFilters) => Promise<void>;
  goToPage: (page: number) => Promise<void>;
}

export function useIncidentsWithFilters(pageSize: number = 10): UseIncidentsWithFiltersReturn {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilters, setCurrentFilters] = useState<IncidentFilters>({});
  const [filterOptions, setFilterOptions] = useState({
    offices: [] as Array<{ id: string; name: string }>,
    incidentTypes: [] as Array<{ id: string; Name: string }>,
    suspects: [] as Array<{ alias: string }>,
  });

  const fetchIncidents = useCallback(async (filters: IncidentFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Preparar los filtros para el backend
      const preparedFilters = {
        ...filters,
        page: filters.page || currentPage,
        page_size: pageSize,
        ordering: '-Date', // Order by date descending
        // Enviar IncidentType como string (nombre del tipo)
        IncidentType: filters.IncidentType,
        // Incluir ID si existe
        id: filters.id
      };
      
      const response = await getIncidents(preparedFilters);
      
      setIncidents(response.results || []);
      setTotalCount(response.count || 0);
      setCurrentFilters(filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar incidentes');
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  const fetchFilterOptions = useCallback(async () => {
    try {
      // Fetch offices
      const officesResponse = await getOffices({ page_size: 100 });
      const offices = officesResponse.results.map(office => ({
        id: office.id.toString(),
        name: office.Name
      }));

      // Fetch incident types
      const incidentTypesResponse = await getIncidentTypes({ page_size: 100 });
      const incidentTypes = incidentTypesResponse.results.map(type => ({
        id: type.id.toString(),
        Name: type.Name
      }));

      // Fetch suspects (get unique aliases)
      const suspectsResponse = await getAllSuspects({ page_size: 100 });
      const uniqueAliases = [...new Set(suspectsResponse.results
        .map(suspect => suspect.Alias)
        .filter(Boolean)
      )];
      const suspects = uniqueAliases.map(alias => ({ alias }));

      setFilterOptions({
        offices,
        incidentTypes,
        suspects
      });
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  }, []);

  const refreshIncidents = useCallback(async () => {
    await fetchIncidents(currentFilters);
  }, [fetchIncidents, currentFilters]);

  const applyFilters = useCallback(async (filters: IncidentFilters) => {
    setCurrentPage(1); // Reset to first page when applying filters
    await fetchIncidents({ ...filters, page: 1 });
  }, [fetchIncidents]);

  const goToPage = useCallback(async (page: number) => {
    setCurrentPage(page);
    await fetchIncidents({ ...currentFilters, page });
  }, [fetchIncidents, currentFilters]);

  useEffect(() => {
    fetchIncidents();
    fetchFilterOptions();
  }, []);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    incidents,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    filterOptions,
    refreshIncidents,
    applyFilters,
    goToPage,
  };
} 