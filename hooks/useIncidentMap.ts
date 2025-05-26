import { useState, useEffect, useCallback } from 'react';
import { getIncidents } from '@/services/incident-service';
import { getOffice } from '@/services/office-service';
import { Incident, IncidentType } from '@/types/incident';
import { Office } from '@/types/office';
import { useIncident } from '@/context/incident-context';

// Hook to fetch incidents with pagination
export function useIncidentsPaginated(pageSize = 10) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    hasNextPage: false,
    totalCount: 0
  });

  // Fetch incidents for a specific page
  const fetchPage = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getIncidents({
        page,
        page_size: pageSize,
        format: 'json'
      });
      
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch incidents');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Load the first page
  const loadInitialData = useCallback(async () => {
    try {
      const response = await fetchPage(1);
      setIncidents(response.results);
      setPagination({
        currentPage: 1,
        hasNextPage: !!response.next,
        totalCount: response.count
      });
    } catch (error) {
      console.error('Error loading initial incidents:', error);
    }
  }, [fetchPage]);

  // Load the next page and append to existing data
  const loadNextPage = useCallback(async () => {
    if (!pagination.hasNextPage || loading) return;
    
    try {
      const nextPage = pagination.currentPage + 1;
      const response = await fetchPage(nextPage);
      
      setIncidents(prev => [...prev, ...response.results]);
      setPagination({
        currentPage: nextPage,
        hasNextPage: !!response.next,
        totalCount: response.count
      });
    } catch (error) {
      console.error('Error loading next page:', error);
    }
  }, [fetchPage, pagination, loading]);

  // Load initial data on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return {
    incidents,
    loading,
    error,
    pagination,
    loadNextPage,
    hasNextPage: pagination.hasNextPage,
    isLoadingNextPage: loading && pagination.currentPage > 1
  };
}

// Hook to fetch and cache offices
export function useOfficesData() {
  const [offices, setOffices] = useState<Map<number, Office>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch a single office by ID
  const fetchOffice = useCallback(async (id: number) => {
    try {
      const office = await getOffice(id);
      if (office) {
        setOffices(prev => {
          const newMap = new Map(prev);
          newMap.set(id, office);
          return newMap;
        });
      }
      return office;
    } catch (err) {
      console.error(`Error fetching office ${id}:`, err);
      return null;
    }
  }, []);
  
  // Fetch multiple offices by ID
  const fetchOffices = useCallback(async (ids: number[]) => {
    if (ids.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Filter out IDs we already have
      const missingIds = ids.filter(id => !offices.has(id));
      
      if (missingIds.length === 0) {
        setLoading(false);
        return;
      }
      
      // Process in batches to avoid too many concurrent requests
      const BATCH_SIZE = 5;
      const batches = [];
      
      for (let i = 0; i < missingIds.length; i += BATCH_SIZE) {
        batches.push(missingIds.slice(i, i + BATCH_SIZE));
      }
      
      for (const batch of batches) {
        await Promise.all(batch.map(id => fetchOffice(id)));
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch offices');
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [offices, fetchOffice]);
  
  return {
    offices,
    loading,
    error,
    fetchOffices
  };
}

// Combined hook that handles both incidents and offices
export function useIncidentOffices() {
  const { 
    incidents: allIncidents, 
    loading: incidentsLoading, 
    error: incidentsError,
    loadNextPage,
    hasNextPage,
    isLoadingNextPage
  } = useIncidentsPaginated();
  
  const { 
    offices, 
    loading: officesLoading, 
    error: officesError,
    fetchOffices 
  } = useOfficesData();
  
  // Extract all unique office IDs from the incidents
  const officeIds = useCallback(() => {
    const ids = new Set<number>();
    
    allIncidents.forEach((incident: Incident & { officeId?: number }) => {
      // Handle both property naming conventions
      const officeId = incident.Office || incident.officeId;
      if (officeId) ids.add(officeId);
    });
    
    return Array.from(ids);
  }, [allIncidents]);
  
  // Fetch office data when incidents change
  useEffect(() => {
    const ids = officeIds();
    if (ids.length > 0) {
      fetchOffices(ids);
    }
  }, [officeIds, fetchOffices]);
  
  // Usar el contexto de incidentes existente para obtener los tipos de incidentes
  const incidentContext = useIncident();
  
  // Cargar los tipos de incidentes cuando se inicia el componente
  useEffect(() => {
    // Cargar los tipos de incidentes si no están cargados
    if (incidentContext.incidentTypes.length === 0 && !incidentContext.loading) {
      incidentContext.loadIncidentTypes();
    }
  }, [incidentContext]);

  // Combine incidents with valid office data and incident types
  const incidentsWithValidOffices = useCallback(() => {
    // Define a type that combines Incident with office, location and type data
    type IncidentWithDetails = Incident & { 
      officeData?: Office; 
      latitude?: number; 
      longitude?: number;
      office_name?: string;
      incidentType?: IncidentType;
    };
    
    const validIncidents: IncidentWithDetails[] = [];
    
    allIncidents.forEach((incident: Incident & { officeId?: number }) => {
      // Get office ID from the incident
      const officeId = incident.Office;
      if (!officeId) return;

      // Get incident type ID if available
      const incidentTypeId = incident.IncidentType;
      
      const office = offices.get(officeId);
      // Always include the incident even if office data is incomplete
      if (!office) {
        // Include incident without location data
        validIncidents.push({
          ...incident,
          // Add empty location data to avoid errors in the map component
          officeData: { 
            id: typeof officeId === 'string' ? parseInt(officeId, 10) || 0 : officeId, 
            Name: incident.office_name || 'Unknown Office', 
            Address: '',
            Geo: '',
            // Añadir propiedades requeridas por Office
            syncVersion: null,
            Closed: null,
            ZipCode: '',
            Province: '',
            Phone: '',
            Mobile: '',
            Code: '',
            ShortCode: '',
            Fax: null,
            Email: '',
            CameraCount: 0,
            NumberOfAccessDoors: 0,
            Country: 0,
            City: 0,
            Company: 0
          },
          // Add incident type if available
          incidentType: incidentTypeId ? incidentContext.incidentTypes.find(type => type.id === incidentTypeId) : undefined
        });
        return;
      }
      
      // Try to parse coordinates if available
      if (office.Geo) {
        try {
          const [lat, lng] = office.Geo.split(',').map(Number);
          
          validIncidents.push({
            ...incident,
            officeData: office,
            // Add parsed coordinates directly to the incident for easy access in the map
            latitude: lat,
            longitude: lng
          });
        } catch (error) {
          console.error('Error parsing office coordinates:', error);
          // Still include the incident with office data even if coordinates parsing fails
          validIncidents.push({
            ...incident,
            officeData: office
          });
        }
      } else {
        // Include the incident with office data even without coordinates
        validIncidents.push({
          ...incident,
          officeData: office
        });
      }
    });
    
    return validIncidents;
  }, [allIncidents, offices, incidentContext.incidentTypes]);

  return {
    incidents: incidentsWithValidOffices(),
    loading: incidentsLoading || officesLoading,
    error: incidentsError || officesError,
    loadNextPage,
    hasNextPage,
    isLoadingNextPage,
    incidentTypes: incidentContext.incidentTypes // Exponer los tipos de incidentes del contexto
  };
}