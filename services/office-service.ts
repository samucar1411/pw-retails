// Import directly to avoid proxy issues, just like auth-service.ts
import { Office, OfficeCreateInput, OfficeUpdateInput } from '@/types/office';
import axios from 'axios';
import https from 'https';

// Define response type for paginated results
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// We don't need the ApiResponse interface anymore since we're using axios directly
// We also don't need the ENDPOINT constant since we're using API_BASE_URL directly

// Helper function to fetch all offices handling pagination
const fetchAllOffices = async (): Promise<Office[]> => {
  try {
    if (typeof window === 'undefined') {
      console.error('[OfficeService] Not running in browser environment');
      return [];
    }
    
    // Get the auth token
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('[OfficeService] No authentication token available');
      return [];
    }
    
    const cleanToken = token.replace(/^(Bearer|Token)\s+/i, '').trim();
    console.log('[OfficeService] Using authentication token, length:', cleanToken.length);
    
    // Create axios instance with SSL certificate validation disabled
    const axiosInstance = axios.create({
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Token ${cleanToken}`
      },
      timeout: 15000
    });
    
    console.log(`[OfficeService] Making request to: /api/offices/`);
    
    // Make API call through Next.js proxy
    const response = await axiosInstance.get<PaginatedResponse<Office>>(`/api/offices/`);
    
    console.log(`[OfficeService] Response status:`, response.status);
    
    if (!response.data || !response.data.results) {
      console.error(`[OfficeService] Invalid response format:`, response.data);
      return [];
    }
    
    console.log(`[OfficeService] Successfully fetched ${response.data.results.length} offices`);
    return response.data.results;
  } catch (error: unknown) {
    console.error('[OfficeService] Error fetching offices:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { data: unknown; status: number } };
      console.error('[OfficeService] Error response data:', axiosError.response.data);
      console.error('[OfficeService] Error response status:', axiosError.response.status);
    }
    return [];
  }
};

export const getOffices = async (): Promise<Office[]> => {
  console.log('[OfficeService] getOffices - Fetching all offices');
  return fetchAllOffices();
};

export const getOffice = async (id: number): Promise<Office | null> => {
  try {
    console.log(`[OfficeService] getOffice - Fetching office with id: ${id}`);
    
    if (typeof window === 'undefined') {
      console.error('[OfficeService] Not running in browser environment');
      return null;
    }
    
    // Get the auth token
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('[OfficeService] No authentication token available');
      return null;
    }
    
    const cleanToken = token.replace(/^(Bearer|Token)\s+/i, '').trim();
    
    // Create axios instance with SSL certificate validation disabled
    const axiosInstance = axios.create({
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Token ${cleanToken}`
      },
      timeout: 15000
    });
    
    console.log(`[OfficeService] Making request to: /api/offices/${id}/`);
    
    const response = await axiosInstance.get(`/api/offices/${id}/`);
    
    console.log(`[OfficeService] Response status:`, response.status);
    console.log(`[OfficeService] Successfully fetched office: ${response.data.Name}`);
    
    return response.data;
  } catch (error: unknown) {
    console.error('[OfficeService] Error fetching office:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { data: unknown; status: number } };
      console.error('[OfficeService] Error response data:', axiosError.response.data);
      console.error('[OfficeService] Error response status:', axiosError.response.status);
    }
    return null;
  }
};

export const createOffice = async (data: OfficeCreateInput): Promise<Office | null> => {
  try {
    console.log(`[OfficeService] createOffice - Creating new office: ${data.Name}`);
    
    if (typeof window === 'undefined') {
      console.error('[OfficeService] Not running in browser environment');
      return null;
    }
    
    // Get the auth token
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('[OfficeService] No authentication token available');
      return null;
    }
    
    const cleanToken = token.replace(/^(Bearer|Token)\s+/i, '').trim();
    
    // Create axios instance with SSL certificate validation disabled
    const axiosInstance = axios.create({
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Token ${cleanToken}`
      },
      timeout: 15000
    });
    
    console.log(`[OfficeService] Making request to: /api/offices/`);
    
    const response = await axiosInstance.post<Office>(`/api/offices/`, data);
    
    console.log(`[OfficeService] Response status:`, response.status);
    console.log(`[OfficeService] Successfully created office with id: ${response.data.id}`);
    
    return response.data;
  } catch (error: unknown) {
    console.error('[OfficeService] Error creating office:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { data: unknown; status: number } };
      console.error('[OfficeService] Error response data:', axiosError.response.data);
      console.error('[OfficeService] Error response status:', axiosError.response.status);
    }
    return null;
  }
};

export const updateOffice = async (id: number, data: OfficeUpdateInput): Promise<Office | null> => {
  try {
    console.log(`[OfficeService] updateOffice - Updating office with id: ${id}`);
    
    if (typeof window === 'undefined') {
      console.error('[OfficeService] Not running in browser environment');
      return null;
    }
    
    // Get the auth token
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('[OfficeService] No authentication token available');
      return null;
    }
    
    const cleanToken = token.replace(/^(Bearer|Token)\s+/i, '').trim();
    
    // Create axios instance with SSL certificate validation disabled
    const axiosInstance = axios.create({
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Token ${cleanToken}`
      },
      timeout: 15000
    });
    
    console.log(`[OfficeService] Making request to: /api/offices/${id}/`);
    
    const response = await axiosInstance.put<Office>(`/api/offices/${id}/`, data);
    
    console.log(`[OfficeService] Response status:`, response.status);
    console.log(`[OfficeService] Successfully updated office: ${response.data.Name}`);
    
    return response.data;
  } catch (error: unknown) {
    console.error('[OfficeService] Error updating office:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { data: unknown; status: number } };
      console.error('[OfficeService] Error response data:', axiosError.response.data);
      console.error('[OfficeService] Error response status:', axiosError.response.status);
    }
    return null;
  }
};

export const deleteOffice = async (id: number): Promise<boolean> => {
  try {
    console.log(`[OfficeService] deleteOffice - Deleting office with id: ${id}`);
    
    if (typeof window === 'undefined') {
      console.error('[OfficeService] Not running in browser environment');
      return false;
    }
    
    // Get the auth token
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('[OfficeService] No authentication token available');
      return false;
    }
    
    const cleanToken = token.replace(/^(Bearer|Token)\s+/i, '').trim();
    
    // Create axios instance with SSL certificate validation disabled
    const axiosInstance = axios.create({
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Token ${cleanToken}`
      },
      timeout: 15000
    });
    
    console.log(`[OfficeService] Making request to: /api/offices/${id}/`);
    
    const response = await axiosInstance.delete(`/api/offices/${id}/`);
    
    console.log(`[OfficeService] Response status:`, response.status);
    console.log(`[OfficeService] Successfully deleted office with id: ${id}`);
    
    return true;
  } catch (error: unknown) {
    console.error('[OfficeService] Error deleting office:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { data: unknown; status: number } };
      console.error('[OfficeService] Error response data:', axiosError.response.data);
      console.error('[OfficeService] Error response status:', axiosError.response.status);
    }
    return false;
  }
}; 