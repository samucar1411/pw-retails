import { Suspect, SuspectStatus } from '../types/suspect';
import { api } from './api';

// SUSPECT FUNCTIONS
export async function getAllSuspects(): Promise<Suspect[]> {
  const { data } = await api.get<Suspect[]>('/suspects');
  return data;
}

export async function createSuspect(suspect: Partial<Suspect>): Promise<Suspect> {
  const { data } = await api.post<Suspect>('/suspects', suspect);
  return data;
}

export async function updateSuspect(id: number, suspect: Partial<Suspect>): Promise<Suspect> {
  const { data } = await api.put<Suspect>(`/suspects/${id}`, suspect);
  return data;
}

export async function deleteSuspect(id: number): Promise<void> {
  await api.delete(`/suspects/${id}`);
}

export async function uploadSuspectPhoto(id: number, file: File): Promise<{ photoUrl: string }> {
  const formData = new FormData();
  formData.append('photo', file);
  const { data } = await api.post<{ photoUrl: string }>(`/suspects/${id}/photo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
}

// SUSPECT STATUS FUNCTIONS
export async function getAllSuspectStatuses(): Promise<SuspectStatus[]> {
  const { data } = await api.get<SuspectStatus[]>('/suspect-statuses');
  return data;
}

export async function createSuspectStatus(status: Partial<SuspectStatus>): Promise<SuspectStatus> {
  const { data } = await api.post<SuspectStatus>('/suspect-statuses', status);
  return data;
}

export async function updateSuspectStatus(id: number, status: Partial<SuspectStatus>): Promise<SuspectStatus> {
  const { data } = await api.put<SuspectStatus>(`/suspect-statuses/${id}`, status);
  return data;
}

export async function deleteSuspectStatus(id: number): Promise<void> {
  await api.delete(`/suspect-statuses/${id}`);
}

// New function to search suspects
export async function searchSuspects(query: string): Promise<Suspect[]> {
  if (!query) {
    return []; // Return empty if query is empty
  }
  // Adjust the endpoint and query parameter based on your API
  const { data } = await api.get<Suspect[]>(`/suspects/search`, {
    params: { q: query } 
  });
  return data;
}