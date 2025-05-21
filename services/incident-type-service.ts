import { IncidentType } from '../types/incident';
import { PaginatedResponse, ListParams } from '../types/api';
import { api } from './api';

const INCIDENT_TYPES_ENDPOINT = '/api/incidenttypes/';

/**
 * Get all incident types with optional pagination
 */
export async function getIncidentTypes(params?: ListParams): Promise<PaginatedResponse<IncidentType>> {
  try {
    const { data } = await api.get<PaginatedResponse<IncidentType>>(INCIDENT_TYPES_ENDPOINT, { 
      params: { ...params, format: 'json' } 
    });
    return data;
  } catch (error) {
    console.error('Error fetching incident types:', error);
    throw error;
  }
}

/**
 * Get a single incident type by ID
 */
export async function getIncidentTypeById(id: number): Promise<IncidentType | null> {
  try {
    const { data } = await api.get<IncidentType>(`${INCIDENT_TYPES_ENDPOINT}${id}/`);
    return data;
  } catch (error) {
    console.error(`Error fetching incident type ${id}:`, error);
    return null;
  }
}

/**
 * Cache for incident types to avoid repeated API calls
 */
const incidentTypeCache = new Map<number, IncidentType>();

/**
 * Get incident type by ID with caching
 */
export async function getIncidentTypeWithCache(id: number): Promise<IncidentType | null> {
  // Check cache first
  if (incidentTypeCache.has(id)) {
    return incidentTypeCache.get(id) || null;
  }
  
  // Fetch from API if not in cache
  try {
    const incidentType = await getIncidentTypeById(id);
    if (incidentType) {
      incidentTypeCache.set(id, incidentType);
    }
    return incidentType;
  } catch (error) {
    console.error(`Error fetching incident type ${id}:`, error);
    return null;
  }
}
