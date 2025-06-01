import { Incident, IncidentType } from '@/types/incident';
import { PaginatedResponse, ListParams } from '@/types/api';
import { api } from '@/services/api';


export async function getIncidents(
  filters: ListParams & {
    fromDate?: string;
    toDate?: string;
    ordering?: string;
    page?: number;
    page_size?: number;
    IncidentType?: string;
    Office?: string; // Backend expects Office parameter directly
    suspect_alias?: string;
  } = {}
): Promise<PaginatedResponse<Incident>> {
  // Debug the filters to see what's being sent
  console.log("Fetching incidents with filters:", JSON.stringify(filters, null, 2));
  
  // Check specifically for incident type filter
  if (filters.IncidentType) {
    console.log(`Filtering by incident type: ${filters.IncidentType}`);
  }
  
  // Only pass parameters in the params object, not in the URL
  const params: Record<string, string | number | boolean | undefined> = { format: 'json' };
  
  // Copy all filters to params - simplified approach
  Object.entries(filters).forEach(([key, value]) => {
    if (key === 'fromDate' && value) {
      params['Date_after'] = value;
    } else if (key === 'toDate' && value) {
      params['Date_before'] = value;
    } else if (value !== undefined && value !== null && value !== '') {
      // For all other parameters, use them directly (including Office)
      params[key] = value;
    }
  });
  
  try {
    // Debug the URL and parameters that will be sent
    console.log(`API Request: GET /api/incidents/ with params:`, params);
    
    const { data } = await api.get<PaginatedResponse<Incident>>('/api/incidents/', { params });
    
    // Debug the response to see what we're receiving
    console.log(`Received ${data.count} incidents for the query`);
    
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
  return getIncidents({
    ...params,
    Office: officeId.toString(),
    ordering: '-created_at'
  });
}

export async function createIncident(incident: Partial<Incident>): Promise<Incident> {
  const { data } = await api.post<Incident>('/api/incidents/', incident);
  return data;
}

export async function updateIncident(id: number, incident: Partial<Incident>): Promise<Incident> {
  const { data } = await api.put<Incident>(`/api/incidents/${id}/`, incident);
  return data;
}

export async function deleteIncident(id: number): Promise<void> {
  await api.delete(`/api/incidents/${id}/`);
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
    `/api/incidents/${id}/attachments/`,
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



export async function createIncidentType(type: Partial<IncidentType>): Promise<IncidentType> {
  const { data } = await api.post<IncidentType>('/api/incidenttypes/', type);
  return data;
}

export async function updateIncidentType(id: number, type: Partial<IncidentType>): Promise<IncidentType> {
  const { data } = await api.put<IncidentType>(`/api/incidenttypes/${id}/`, type);
  return data;
}

export async function deleteIncidentType(id: number): Promise<void> {
  await api.delete(`/api/incidenttypes/${id}/`);
}

/**
 * Get latest incidents ordered by creation date (newest first)
 */
export async function getLatestIncidents(params: ListParams = {}): Promise<PaginatedResponse<Incident>> {
  return getIncidents({
    ...params,
    ordering: '-created_at'
  });
}