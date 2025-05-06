import { Incident, IncidentType } from '../types/incident';
import { api } from './api';

// INCIDENT FUNCTIONS
export async function getAllIncidents(): Promise<Incident[]> {
  const { data } = await api.get<Incident[]>('/incidents');
  return data;
}

export async function getIncidentsByOffice(officeId: number): Promise<Incident[]> {
  const { data } = await api.get<Incident[]>(`/incidents/office/${officeId}`);
  return data;
}

export async function createIncident(incident: Partial<Incident>): Promise<Incident> {
  const { data } = await api.post<Incident>('/incidents', incident);
  return data;
}

export async function updateIncident(id: number, incident: Partial<Incident>): Promise<Incident> {
  const { data } = await api.put<Incident>(`/incidents/${id}`, incident);
  return data;
}

export async function deleteIncident(id: number): Promise<void> {
  await api.delete(`/incidents/${id}`);
}

export async function uploadIncidentAttachments(id: number, files: File[]): Promise<{ attachments: { url: string }[] }> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('attachments', file);
  });
  const { data } = await api.post<{ attachments: { url: string }[] }>(
    `/incidents/${id}/attachments`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return data;
}

// INCIDENT TYPE FUNCTIONS
export async function getAllIncidentTypes(): Promise<IncidentType[]> {
  const { data } = await api.get<IncidentType[]>('/incident-types');
  return data;
}

export async function createIncidentType(type: Partial<IncidentType>): Promise<IncidentType> {
  const { data } = await api.post<IncidentType>('/incident-types', type);
  return data;
}

export async function updateIncidentType(id: number, type: Partial<IncidentType>): Promise<IncidentType> {
  const { data } = await api.put<IncidentType>(`/incident-types/${id}`, type);
  return data;
}

export async function deleteIncidentType(id: number): Promise<void> {
  await api.delete(`/incident-types/${id}`);
}