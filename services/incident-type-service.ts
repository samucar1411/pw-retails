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
    console.log(`Fetching incident type from API: ${INCIDENT_TYPES_ENDPOINT}${id}/`);
    const response = await api.get<IncidentType>(`${INCIDENT_TYPES_ENDPOINT}${id}/`);
    console.log(`API response for incident type ${id}:`, response.data);
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 
        'status' in error.response && error.response.status === 404) {
      console.warn(`Incident type with ID ${id} not found (404)`);
    } else {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error fetching incident type ${id}:`, errorMessage, error);
    }
    // Return a default incident type with minimal info - the cache function will handle it
    return { id, Name: '', Description: '' } as IncidentType;
  }
}

/**
 * Get incident type by ID with caching
 */
export async function getIncidentTypeWithCache(id: number): Promise<IncidentType> {
  console.log(`Getting incident type for ID: ${id}`);
  
  // Check cache first
  if (incidentTypeCache.has(id)) {
    const cached = incidentTypeCache.get(id)!;
    console.log(`Found incident type in cache:`, cached);
    return cached;
  }
  
  // Fetch from API if not in cache
  const incidentType = await getIncidentTypeById(id);
  console.log(`Fetched incident type from API:`, incidentType);
  
  // If we got a valid incident type with a Name, cache it
  if (incidentType && incidentType.Name) {
    incidentTypeCache.set(id, incidentType);
    console.log(`Cached incident type:`, incidentType);
    return incidentType;
  }
  
  // Return a default incident type with the requested ID
  const defaultType = { id, Name: `Tipo ${id}`, Description: '' } as IncidentType;
  console.log(`Using default incident type:`, defaultType);
  return defaultType;
}
