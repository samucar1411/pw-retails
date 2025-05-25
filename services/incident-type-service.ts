import { IncidentType } from '@/types/incident';
import { PaginatedResponse, ListParams } from '@/types/api';
import { api } from './api';

const INCIDENT_TYPES_ENDPOINT = '/api/incidenttypes/';

// Cache for incident types to avoid repeated API calls
const incidentTypeCache = new Map<number, IncidentType>();



/**
 * Get all incident types with optional pagination
 */
export async function getIncidentTypes(params?: ListParams): Promise<PaginatedResponse<IncidentType>> {
  try {
    const { data } = await api.get<PaginatedResponse<IncidentType>>(INCIDENT_TYPES_ENDPOINT, { 
      params: { ...params, format: 'json' } 
    });
    return data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching incident types:', errorMessage);
    return {
      count: 0,
      results: [],
      next: null,
      previous: null
    };
  }
}

/**
 * Get a single incident type by ID
 */
export async function getIncidentTypeById(id: number): Promise<IncidentType> {
  try {
    const response = await api.get<IncidentType>(`${INCIDENT_TYPES_ENDPOINT}${id}/`);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 
        'status' in error.response && error.response.status === 404) {
      console.warn(`Incident type with ID ${id} not found, returning default`);
    } else {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error fetching incident type ${id}:`, errorMessage);
    }
    return { id } as IncidentType;
  }
}

/**
 * Get incident type by ID with caching
 */
export async function getIncidentTypeWithCache(id: number): Promise<IncidentType> {
  // Check cache first
  if (incidentTypeCache.has(id)) {
    return incidentTypeCache.get(id)!;
  }
  
  // Fetch from API if not in cache
  const incidentType = await getIncidentTypeById(id);
  
  // If we got a valid incident type (not the default one), cache it
  if (incidentType.id !== 0) {
    incidentTypeCache.set(id, incidentType);
    return incidentType;
  }
  
  // Return the default incident type with the requested ID
  return { ...DEFAULT_INCIDENT_TYPE, id } as IncidentType;
}
