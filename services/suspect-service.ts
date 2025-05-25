import { Suspect, SuspectTableItem, SuspectStatus } from '../types/suspect';
import { PaginatedResponse, ListParams } from '../types/api';
import { api } from './api';

// Default suspect to use when a suspect is not found
const DEFAULT_SUSPECT: Suspect = {
  id: 'unknown',
  Alias: 'Sospechoso desconocido',
  PhysicalDescription: 'Información no disponible',
  PhotoUrl: '',
  Status: 0,
  StatusDetails: {
    id: 0,
    Name: 'Desconocido'
  }
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
    ordering?: string;
    page?: number;
    page_size?: number;
    search?: string;
  } = {}
): Promise<PaginatedResponse<Suspect>> {
  console.log("Fetching suspects with page:", filters.page);
  
  // Only pass parameters in the params object, not in the URL
  const params = { ...filters, format: 'json' };
  
  try {
    const { data } = await api.get<PaginatedResponse<Suspect>>('/api/suspects/', { params });
    console.log("Fetched suspects:", data.results.length);
    return data;
  } catch (error) {
    console.error("Error fetching suspects:", error);
    throw error;
  }
}


export async function createSuspect(suspect: Partial<Suspect>): Promise<Suspect | null> {
  try {
    const { data } = await api.post<Suspect>(SUSPECTS_ENDPOINT, suspect);
    return data;
  } catch (error) {
    console.error('Error creating suspect:', error);
    return null;
  }
}

export async function getSuspect(id: string): Promise<Suspect | null> {
  try {
    console.log(`Fetching suspect with ID via proxy: ${id}`);
    
    // Use the 'api' (getConfiguredAxios) instance and the proxied path
    const { data } = await api.get<Suspect>(`${SUSPECTS_ENDPOINT}${id}/`, {
      params: { format: 'json' } 
    });
    
    console.log(`Successfully fetched suspect:`, data);
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