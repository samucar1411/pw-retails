import { api } from './api';

export interface IncidentImageMetadata {
  id?: number;
  filename: string;
  user_id: string;
  description: string;
  upload_time?: string;
  file_path?: string | null;
  received_data?: any;
  status?: string | null;
  message?: string | null;
  similarity_percentage?: number | null;
  threshold?: number | null;
  is_match: boolean;
  is_blacklisted: boolean;
  img_file?: File | string | null; // Can be File for create/update, string URL for GET
  Tags?: any;
}

export interface IncidentImageMetadataResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IncidentImageMetadata[];
}

export interface IncidentImageMetadataCreateInput {
  filename: string;
  user_id: string;
  description: string;
  img_file: File;
  Tags?: any;
}

/**
 * Get all incident image metadata
 */
export async function getAllIncidentImageMetadata(): Promise<IncidentImageMetadataResponse> {
  try {
    const response = await api.get('/api/incidentImageMetadata/');
    return response.data;
  } catch (error) {
    console.error('Error fetching incident image metadata:', error);
    throw error;
  }
}

/**
 * Create new incident image metadata
 */
export async function createIncidentImageMetadata(data: IncidentImageMetadataCreateInput): Promise<IncidentImageMetadata> {
  try {
    const formData = new FormData();
    formData.append('filename', data.filename);
    formData.append('user_id', data.user_id);
    formData.append('description', data.description);
    formData.append('img_file', data.img_file);
    
    if (data.Tags) {
      formData.append('Tags', JSON.stringify(data.Tags));
    }

    const response = await api.post('/api/incidentImageMetadata/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating incident image metadata:', error);
    throw error;
  }
}

/**
 * Get incident image metadata by ID
 */
export async function getIncidentImageMetadataById(id: number): Promise<IncidentImageMetadata> {
  try {
    const response = await api.get(`/api/incidentImageMetadata/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching incident image metadata by ID:', error);
    throw error;
  }
}

/**
 * Update incident image metadata
 */
export async function updateIncidentImageMetadata(id: number, data: Partial<IncidentImageMetadataCreateInput>): Promise<IncidentImageMetadata> {
  try {
    const formData = new FormData();
    
    if (data.filename) formData.append('filename', data.filename);
    if (data.user_id) formData.append('user_id', data.user_id);
    if (data.description) formData.append('description', data.description);
    if (data.img_file) formData.append('img_file', data.img_file);
    if (data.Tags) formData.append('Tags', JSON.stringify(data.Tags));

    const response = await api.patch(`/api/incidentImageMetadata/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating incident image metadata:', error);
    throw error;
  }
}

/**
 * Delete incident image metadata
 */
export async function deleteIncidentImageMetadata(id: number): Promise<void> {
  try {
    await api.delete(`/api/incidentImageMetadata/${id}/`);
  } catch (error) {
    console.error('Error deleting incident image metadata:', error);
    throw error;
  }
}