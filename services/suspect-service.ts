import { Suspect, SuspectTableItem, SuspectStatus } from '../types/suspect';
import { PaginatedResponse, ListParams } from '../types/api';
import { api } from './api';

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
    console.log(`Fetching suspect with ID: ${id}`);
    
    // Make a direct API call to the backend instead of using the Next.js API route
    // This avoids potential issues with the API route implementation
    const response = await fetch(`https://sys.adminpy.com:18001/api/suspects/${id}/?format=json`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
    });
    
    if (!response.ok) {
      console.error(`Backend API error for suspect ${id}:`, response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    console.log(`Successfully fetched suspect:`, data);
    return data;
  } catch (error) {
    console.error(`Error fetching suspect ${id}:`, error);
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

// Get a single suspect by ID
export async function getSuspectById(id: string): Promise<Suspect | null> {
  try {
    const { data } = await api.get<Suspect>(`${SUSPECTS_ENDPOINT}${id}/`);
    return data;
  } catch (error) {
    console.error(`Error fetching suspect ${id}:`, error);
    return null;
  }
}

export async function getSuspectTableItemById(id: string): Promise<SuspectTableItem | null> {
  try {
    return await getSuspectById(id);
  } catch (error) {
    console.error(`Error fetching suspect table item ${id}:`, error);
    return null;
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