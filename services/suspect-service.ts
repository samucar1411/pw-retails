import { Suspect, SuspectTableItem, SuspectStatus, SuspectPartnerRelation, SuspectPartnerRelationResponse } from '../types/suspect';
import { PaginatedResponse, ListParams } from '../types/api';
import { api } from './api';

// Default suspect to use when a suspect is not found
const DEFAULT_SUSPECT: Suspect = {
  id: 'unknown',
  Alias: 'Sospechoso desconocido',
  PhysicalDescription: 'Información no disponible',
  PhotoUrl: '',
  Status: 0,
  Tags: {}  // Changed to empty object to match the type
};

// API ENDPOINTS
const SUSPECTS_ENDPOINT = '/api/suspects/';
const SUSPECT_STATUS_ENDPOINT = '/api/suspectstatus/';

// SUSPECT STATUS FUNCTIONS
export async function getSuspectStatuses(): Promise<SuspectStatus[]> {
  try {
    const { data } = await api.get<{ results: SuspectStatus[] }>(SUSPECT_STATUS_ENDPOINT);
    return data.results;
  } catch (error) {
    console.error('Error fetching suspect statuses:', error);
    return [];
  }
}

// SUSPECT FUNCTIONS

export async function getAllSuspects(
  filters: ListParams & {
    created_at_after?: string;
    created_at_before?: string;
    fromDate?: string;
    toDate?: string;
    ordering?: string;
    page?: number;
    page_size?: number;
    search?: string;
    tags?: string | string[];
    Status?: string | number;
    alias?: string;
    id?: string;
    suspects_tags?: string | string[];
  } = {}
): Promise<PaginatedResponse<Suspect>> {
  // Only pass parameters in the params object, not in the URL
  const cleanParams: Record<string, string | number> = { format: 'json' };
  
  // Copiar los filtros válidos a cleanParams
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'tags' || key === 'suspects_tags') {
        cleanParams[key] = Array.isArray(value) ? value.join(',') : value;
      } else if (key === 'Status') {
        // Asegurarse de que el estado se envía como número y con el nombre correcto
        const statusValue = Number(value);
        // Solo enviar status válidos (1 = Detenido, 2 = Libre, 3 = Preso)
        if (statusValue >= 1 && statusValue <= 3) {
          cleanParams['status'] = statusValue;
        }
      } else if (key === 'id') {
        // Buscar por ID exacto
        cleanParams[key] = value;
      } else if (key === 'alias') {
        // Buscar por alias exacto o parcial
        cleanParams.alias__icontains = value;
      } else if (key === 'fromDate') {
        // Map fromDate to created_at_after
        cleanParams.created_at_after = value;
      } else if (key === 'toDate') {
        // Map toDate to created_at_before
        cleanParams.created_at_before = value;
      } else {
        cleanParams[key] = value as string | number;
      }
    }
  });
  
  try {
    const { data } = await api.get<PaginatedResponse<Suspect>>('/api/suspects/', { params: cleanParams });
    return data;
  } catch (error) {
    console.error("Error fetching suspects:", error);
    throw error;
  }
}


export async function createSuspect(suspect: Partial<Suspect> | FormData): Promise<Suspect | null> {
  try {
    let config = {};
    
    // For FormData, don't set Content-Type - let the browser set it automatically
    if (suspect instanceof FormData) {
      // Remove any Content-Type header for FormData to let browser set the boundary
      config = {
        headers: {
          // Don't set Content-Type for FormData
        }
      };
    } else {
      config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
    }
    
    const { data } = await api.post<Suspect>(SUSPECTS_ENDPOINT, suspect, config);
    return data;
  } catch (error) {
    console.error('Error creating suspect:', error);
    return null;
  }
}

export async function getSuspect(id: string): Promise<Suspect | null> {
  try {
    // Use the 'api' (getConfiguredAxios) instance and the proxied path
    const { data } = await api.get<Suspect>(`${SUSPECTS_ENDPOINT}${id}/`, {
      params: { format: 'json' } 
    });
    
    return data;
  } catch (error) {
    console.error(`Error fetching suspect ${id}:`, error);
    // Consider re-throwing or handling specific error statuses (e.g., 404)
    return null;
  }
}

export async function updateSuspect(id: string, suspect: Partial<Suspect>): Promise<Suspect | null> {
  try {
    const { data } = await api.put<Suspect>(`${SUSPECTS_ENDPOINT}${id}/`, suspect);
    return data;
  } catch (error) {
    console.error(`Error updating suspect ${id}:`, error);
    return null;
  }
}

export async function deleteSuspect(id: string): Promise<boolean> {
  try {
    await api.delete(`${SUSPECTS_ENDPOINT}${id}/`);
    return true;
  } catch (error) {
    console.error(`Error deleting suspect ${id}:`, error);
    return false;
  }
}

export async function uploadSuspectPhoto(id: string, file: File): Promise<{ PhotoUrl: string } | null> {
  try {
    const formData = new FormData();
    formData.append('photo', file);
    
    const { data } = await api.post<{ PhotoUrl: string }>(
      `${SUSPECTS_ENDPOINT}${id}/upload_photo/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    // Update the suspect with the new photo URL
    if (data.PhotoUrl) {
      await updateSuspect(id, { PhotoUrl: data.PhotoUrl });
    }
    
    return { PhotoUrl: data.PhotoUrl };
  } catch (error) {
    console.error(`Error uploading photo for suspect ${id}:`, error);
    throw error; // Re-throw to handle in the component
  }
}

export async function deleteSuspectPhoto(id: string): Promise<boolean> {
  try {
    await api.delete(`${SUSPECTS_ENDPOINT}${id}/delete_photo/`);
    // Update the suspect to remove the photo URL
    await updateSuspect(id, { PhotoUrl: '' });
    return true;
  } catch (error) {
    console.error(`Error deleting photo for suspect ${id}:`, error);
    return false;
  }
}

// Get a single suspect by ID with graceful error handling
export async function getSuspectById(id: string): Promise<Suspect> {
  try {
    const { data } = await api.get<Suspect>(`${SUSPECTS_ENDPOINT}${id}/`);
    return data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 
        'status' in error.response && error.response.status === 404) {
      console.warn(`Suspect with ID ${id} not found`);
    } else {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error fetching suspect ${id}:`, errorMessage);
    }
    return { ...DEFAULT_SUSPECT, id };
  }
}

// Get suspect table item by ID with graceful error handling
export async function getSuspectTableItemById(id: string): Promise<SuspectTableItem> {
  try {
    const suspect = await getSuspectById(id);
    return suspect || { ...DEFAULT_SUSPECT, id };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching suspect table item ${id}:`, errorMessage);
    return { ...DEFAULT_SUSPECT, id };
  }
}

// Search suspects with pagination
export async function searchSuspects(query: string, params?: ListParams): Promise<PaginatedResponse<Suspect>> {
  const searchParams = {
    ...params,
    search: query,
  };
  
  const { data } = await api.get<PaginatedResponse<Suspect>>(SUSPECTS_ENDPOINT, { 
    params: searchParams 
  });
  
  return data;
}

/**
 * Buscar sospechosos por tags
 */
export async function searchSuspectsByTags(
  tags: string | string[],
  params: ListParams = {}
): Promise<PaginatedResponse<Suspect>> {
  return getAllSuspects({
    ...params,
    tags,
    ordering: '-created_at'
  });
}

// SUSPECT PARTNER RELATIONS ENDPOINTS AND FUNCTIONS
const SUSPECT_PARTNER_RELATIONS_ENDPOINT = '/api/suspectPartnerRelations/';

export async function getSuspectPartnerRelations(params: ListParams = {}): Promise<SuspectPartnerRelationResponse> {
  try {
    const { data } = await api.get<SuspectPartnerRelationResponse>(SUSPECT_PARTNER_RELATIONS_ENDPOINT, {
      params: { ...params, format: 'json' }
    });
    return data;
  } catch (error) {
    console.error('Error fetching suspect partner relations:', error);
    throw error;
  }
}

export async function createSuspectPartnerRelation(relation: Partial<SuspectPartnerRelation>): Promise<SuspectPartnerRelation> {
  try {
    const { data } = await api.post<SuspectPartnerRelation>(
      SUSPECT_PARTNER_RELATIONS_ENDPOINT,
      relation,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return data;
  } catch (error) {
    console.error('Error creating suspect partner relation:', error);
    throw error;
  }
}

export async function updateSuspectPartnerRelation(
  id: string,
  relation: Partial<SuspectPartnerRelation>
): Promise<SuspectPartnerRelation> {
  try {
    const { data } = await api.patch<SuspectPartnerRelation>(
      `${SUSPECT_PARTNER_RELATIONS_ENDPOINT}${id}/`,
      relation
    );
    return data;
  } catch (error) {
    console.error(`Error updating suspect partner relation ${id}:`, error);
    throw error;
  }
}

export async function deleteSuspectPartnerRelation(id: string): Promise<boolean> {
  try {
    await api.delete(`${SUSPECT_PARTNER_RELATIONS_ENDPOINT}${id}/`);
    return true;
  } catch (error) {
    console.error(`Error deleting suspect partner relation ${id}:`, error);
    return false;
  }
}

export async function getSuspectPartnerRelationById(id: string): Promise<SuspectPartnerRelation | null> {
  try {
    const { data } = await api.get<SuspectPartnerRelation>(
      `${SUSPECT_PARTNER_RELATIONS_ENDPOINT}${id}/`
    );
    return data;
  } catch (error) {
    console.error(`Error fetching suspect partner relation ${id}:`, error);
    return null;
  }
}