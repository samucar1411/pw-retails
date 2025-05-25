import { Office, OfficeCreateInput, OfficeUpdateInput } from '@/types/office';
import { PaginatedResponse, ListParams } from '@/types/api';
import { api } from './api';

const OFFICES_ENDPOINT = '/api/offices/';

/**
 * Get paginated list of offices
 * @param params Optional query parameters for pagination and filtering
 * @returns PaginatedResponse containing offices and pagination info
 */
export const getOffices = async (params?: ListParams): Promise<PaginatedResponse<Office>> => {
  try {
    const response = await api.get<PaginatedResponse<Office>>(OFFICES_ENDPOINT, { 
      params: { 
        ...params,
        format: 'json' 
      } 
    });
    return response.data;
  } catch (error) {
    console.error('[OfficeService] Error fetching offices:', error);
    // Return empty results on error to prevent UI from breaking
    return { 
      count: 0, 
      next: null, 
      previous: null, 
      results: [] 
    };
  }
};

/**
 * Get a single office by ID
 * @param id Office ID
 * @returns Office object or null if not found
 */
export const getOffice = async (id: number): Promise<Office | null> => {
  if (!id) {
    return null;
  }
  
  try {
    const response = await api.get<Office>(`${OFFICES_ENDPOINT}${id}/`, {
      validateStatus: (status) => status < 500 // Don't throw for 404 errors
    });
    
    if (response.status === 404) {
      return null; // Office not found
    }
    
    if (response.status >= 400) {
      console.warn(`[OfficeService] Server error ${response.status} when fetching office ${id}`);
      return null;
    }
    
    return response.data;
  } catch (error: unknown) {
    // Only log unexpected errors (not 404s)
    const axiosError = error as { response?: { status?: number } };
    if (!axiosError?.response || axiosError.response.status !== 404) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[OfficeService] Error fetching office ${id}:`, errorMessage);
    }
    return null;
  }
};

/**
 * Create a new office
 * @param data Office data
 * @returns Created office or null on error
 */
export const createOffice = async (data: OfficeCreateInput): Promise<Office | null> => {
  try {
    const response = await api.post<Office>(OFFICES_ENDPOINT, data);
    return response.data;
  } catch (error) {
    console.error('[OfficeService] Error creating office:', error);
    return null;
  }
};

/**
 * Update an existing office
 * @param id Office ID
 * @param data Updated office data
 * @returns Updated office or null on error
 */
export const updateOffice = async (
  id: number,
  data: OfficeUpdateInput
): Promise<Office | null> => {
  if (!id) {
    console.error('[OfficeService] No office ID provided for update');
    return null;
  }
  
  try {
    const response = await api.patch<Office>(`${OFFICES_ENDPOINT}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`[OfficeService] Error updating office ${id}:`, error);
    return null;
  }
};

/**
 * Delete an office
 * @param id Office ID
 * @returns True if deleted successfully, false otherwise
 */
export const deleteOffice = async (id: number): Promise<boolean> => {
  if (!id) {
    console.error('[OfficeService] No office ID provided for deletion');
    return false;
  }
  
  try {
    await api.delete(`${OFFICES_ENDPOINT}${id}/`);
    return true;
  } catch (error) {
    console.error(`[OfficeService] Error deleting office ${id}:`, error);
    return false;
  }
};

/**
 * Backward compatibility function that fetches all pages
 * @deprecated Use getOffices with pagination instead
 * @returns Array of all offices
 */
export async function getAllOffices(): Promise<Office[]> {
  const allOffices: Office[] = [];
  let page = 1;
  const pageSize = 100;
  const MAX_PAGES = 10; // Safety limit to prevent infinite loops
  
  try {
    console.log('[OfficeService] getAllOffices: Starting to fetch all offices');
    
    while (page <= MAX_PAGES) { // Add safety limit
      console.log(`[OfficeService] getAllOffices: Fetching page ${page}`);
      const response = await getOffices({ page, pageSize });
      
      if (!response.results || response.results.length === 0) {
        console.log('[OfficeService] getAllOffices: No more results, breaking loop');
        break;
      }
      
      allOffices.push(...response.results);
      console.log(`[OfficeService] getAllOffices: Added ${response.results.length} offices, total now: ${allOffices.length}`);
      
      // More robust check for next page
      if (!response.next || response.results.length < pageSize) {
        console.log('[OfficeService] getAllOffices: No next page or incomplete page, breaking loop');
        break;
      }
      
      page++;
    }
    
    if (page > MAX_PAGES) {
      console.warn(`[OfficeService] getAllOffices: Reached maximum page limit (${MAX_PAGES}), stopping fetch`);
    }
    
    console.log(`[OfficeService] getAllOffices: Completed with ${allOffices.length} total offices`);
    return allOffices;
  } catch (error) {
    console.error('[OfficeService] getAllOffices: Error fetching all offices:', error);
    return allOffices; // Return whatever we've collected so far
  }
}