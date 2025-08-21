import { Incident, IncidentType } from '@/types/incident';
import { PaginatedResponse, ListParams } from '@/types/api';
import { api } from '@/services/api';
import { getIncidentItemLosses, IncidentItemLoss } from './incident-item-losses-service';
import { getIncidentImageMetadataById } from './incident-image-metadata-service';


export async function getIncidents(
  filters: ListParams & {
    fromDate?: string;
    toDate?: string;
    ordering?: string;
    page?: number;
    page_size?: number;
    IncidentType?: string | number;
    Office?: string;
    suspect_alias?: string;
    suspects_tags?: string | string[]; // Añadido para filtrar por tags de sospechosos
    id?: string; // Añadido para búsqueda por ID
  } = {}
): Promise<PaginatedResponse<Incident>> {
  // Create clean params object to avoid conflicts
  const params: Record<string, string | number> = {};
  
  // Always include format and expand Office
  params.format = 'json';
  params.expand = 'Office';
  
  // Add filters with proper key mapping and validation
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'fromDate' && value) {
        params.Date_after = value;
      } else if (key === 'toDate' && value) {
        params.Date_before = value;
      } else if (key === 'suspects_tags') {
        // Si es un array, lo unimos con comas
        params.suspects_tags = Array.isArray(value) ? value.join(',') : value;
      } else if (key === 'format' || key === 'expand') {
        // Skip - already added
      } else if (key === 'id') {
        // Si es un ID, usarlo directamente
        params.id = value;
      } else if (key === 'IncidentType') {
        // Enviar el tipo de incidente como string (nombre del tipo)
        params[key] = value;
      } else {
        // For all other parameters, use them directly (including Office)
        params[key] = value;
      }
    }
  });
  
  try {
    const { data } = await api.get<PaginatedResponse<Incident>>('/api/incidents/', { params });
    
    return data;
  } catch (error) {
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

export async function updateIncident(id: string, incident: Partial<Incident>): Promise<Incident> {
  const { data } = await api.put<Incident>(`/api/incidents/${id}/`, incident);
  return data;
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
    return null;
  }
}

/**
 * Get a single incident by ID
 */
export async function getIncidentById(id: string | number): Promise<Incident> {
  try {
    const { data } = await api.get<Incident>(`/api/incidents/${id}/`, {
      params: { format: 'json' }
    });
    
    // Load incident item losses separately
    try {
      const allIncidentItemLosses = await getIncidentItemLosses();
      const incidentItemLosses = allIncidentItemLosses.filter(item => 
        String(item.Incident) === String(id)
      );
      
      // Add the incident item losses to the incident data
      data.IncidentItemLosses = incidentItemLosses;
    } catch (itemLossError) {
      data.IncidentItemLosses = [];
    }
    
    // Load images from IncidentImageMetadata if Images contains IDs
    try {
      if (data.Images && data.Images.length > 0) {
        // Check if Images contains IDs (numbers) instead of File objects
        const firstImage = data.Images[0];
        if (typeof firstImage === 'number') {
          // Images are IDs, fetch each IncidentImageMetadata by ID
          const imageIds = data.Images as unknown as number[];
          const imagePromises = imageIds.map(imageId => 
            getIncidentImageMetadataById(imageId).catch(error => {
              console.error(`Error loading image metadata for ID ${imageId}:`, error);
              return null;
            })
          );
          
          const imageResults = await Promise.all(imagePromises);
          const validImages = imageResults.filter(Boolean);
          
          // Convert IncidentImageMetadata to File format expected by frontend
          data.Images = validImages.map(img => {
            // Handle img_file which can be File or string URL
            let imageUrl = '';
            if (img!.img_file) {
              if (typeof img!.img_file === 'string') {
                imageUrl = img!.img_file;
                // Fix URL if it's missing the port :18001
                if (imageUrl.includes('sys.adminpy.com') && !imageUrl.includes(':18001')) {
                  imageUrl = imageUrl.replace('sys.adminpy.com', 'sys.adminpy.com:18001');
                }
              } else if (img!.img_file instanceof File) {
                imageUrl = URL.createObjectURL(img!.img_file);
              }
            } else {
              imageUrl = img!.file_path || '';
              // Fix URL if it's missing the port :18001
              if (imageUrl.includes('sys.adminpy.com') && !imageUrl.includes(':18001')) {
                imageUrl = imageUrl.replace('sys.adminpy.com', 'sys.adminpy.com:18001');
              }
            }
            
            return {
              id: img!.id!,
              name: img!.filename,
              url: imageUrl,
              contentType: 'image/jpeg' // Default, could be improved
            };
          });
        }
      }
    } catch (imageError) {
      console.error('Error loading incident images:', imageError);
      // Keep original Images if error
    }
    
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Delete an incident by ID
 */
export async function deleteIncident(id: string | number): Promise<void> {
  try {
    await api.delete(`/api/incidents/${id}/`);
  } catch (error) {
    throw error;
  }
}

export async function uploadIncidentAttachments(id: string, files: File[]): Promise<{ attachments: { url: string }[] }> {
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

/**
 * Buscar incidentes por tags de sospechosos
 */
export async function searchIncidentsBySuspectTags(
  tags: string | string[],
  params: ListParams = {}
): Promise<PaginatedResponse<Incident>> {
  return getIncidents({
    ...params,
    suspects_tags: tags,
    ordering: '-created_at'
  });
}