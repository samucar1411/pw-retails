import { Incident, IncidentType } from '../types/incident';
import { PaginatedResponse, ListParams } from '../types/api';
import { api } from './api';


export async function getIncidents(
  filters: ListParams & {
    created_at_after?: string;
    created_at_before?: string;
    ordering?: string;
    page?: number;
    page_size?: number;
    IncidentType?: number;
    Office?: number;
    suspect_alias?: string;
  } = {}
): Promise<PaginatedResponse<Incident>> {
  console.log("Fetching incidents with page:", filters.page);
  
  // Only pass parameters in the params object, not in the URL
  const params = { ...filters, format: 'json' };
  
  try {
    const { data } = await api.get<PaginatedResponse<Incident>>('/api/incidents/', { params });
    return data;
  } catch (error) {
    console.error("Error fetching incidents:", error);
    throw error;
  }
}


export async function getIncidentsByOffice(
  officeId: number,
  params?: ListParams
): Promise<PaginatedResponse<Incident>> {
  const { data } = await api.get<PaginatedResponse<Incident>>(
    `/incidents/office/${officeId}/`,
    { params: { ...params, format: 'json' } }
  );
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

/**
 * Get incident type by ID
 */
export async function getIncidentType(id: number): Promise<IncidentType | null> {
  if (!id) return null;
  
  try {
    const { data } = await api.get<IncidentType>(`/api/incidenttypes/${id}/`, {
      params: { format: 'json' }
    });
    return data;
  } catch (error) {
    console.error(`Error fetching incident type ${id}:`, error);
    return null;
  }
}

/**
 * Get a single incident by ID
 */
export async function getIncidentById(id: string | number): Promise<Incident> {
  try {
    console.log(`Fetching incident with ID: ${id}`);
    const { data } = await api.get<Incident>(`/api/incidents/${id}/`, {
      params: { format: 'json' }
    });
    return data;
  } catch (error) {
    console.error(`Error fetching incident ${id}:`, error);
    throw error;
  }
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
export async function getIncidentTypes(params?: ListParams): Promise<PaginatedResponse<IncidentType>> {
  const { data } = await api.get<PaginatedResponse<IncidentType>>('/api/incidenttypes/', { 
    params: { ...params, format: 'json' } 
  });
  return data;
}

/**
 * @deprecated Use getIncidentTypes with pagination instead
 */
export async function getAllIncidentTypes(): Promise<IncidentType[]> {
  try {
    const { data } = await api.get<PaginatedResponse<IncidentType>>('/api/incidenttypes/', { 
      params: { format: 'json' } 
    });
    return data.results || [];
  } catch (error) {
    console.error('Error in getAllIncidentTypes:', error);
    return [];
  }
}

export async function createIncidentType(type: Partial<IncidentType>): Promise<IncidentType> {
  const { data } = await api.post<IncidentType>('/incidenttypes/', type);
  return data;
}

export async function updateIncidentType(id: number, type: Partial<IncidentType>): Promise<IncidentType> {
  const { data } = await api.put<IncidentType>(`/incidenttypes/${id}`, type);
  return data;
}

export async function deleteIncidentType(id: number): Promise<void> {
  await api.delete(`/incidenttypes/${id}`);
}