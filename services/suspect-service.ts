import { Suspect, SuspectTableItem } from '../types/suspect';
import { PaginatedResponse, ListParams } from '../types/api';
import { api } from './api';

// SUSPECT FUNCTIONS
const SUSPECTS_ENDPOINT = '/api/suspects/';

export async function getAllSuspects(params?: ListParams): Promise<PaginatedResponse<Suspect>> {
  const { data } = await api.get<PaginatedResponse<Suspect>>('/api/suspects/', { 
    params: { ...params, format: 'json' } 
  });

  console.log("sospechosos", data)
  return data;
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