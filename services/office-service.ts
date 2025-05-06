import { Office, OfficeCreateInput, OfficeUpdateInput, PaginatedOfficesResponse } from '@/types/office';
import { getResource, createResource, updateResource, deleteResource } from './api';

// Assuming getResource returns a structure like { data: T }
// If the actual structure is different, this type might need adjustment
interface ApiResponse<T> {
  data: T;
  // Add other potential properties of the response object if known (e.g., status, headers)
}

const ENDPOINT = '/api/offices/';

// Helper function to fetch all offices handling pagination
const fetchAllOffices = async (url: string): Promise<Office[]> => {
  let offices: Office[] = [];
  let nextUrl: string | null = url;

  while (nextUrl) {
    // Assuming getResource can take a full URL and returns ApiResponse<PaginatedOfficesResponse>
    const response: ApiResponse<PaginatedOfficesResponse> = await getResource<PaginatedOfficesResponse>(nextUrl);
    offices = offices.concat(response.data.results);
    nextUrl = response.data.next;
  }

  return offices;
};

export const getOffices = async (): Promise<Office[]> => {
  try {
    // Start fetching from the initial endpoint
    const allOffices = await fetchAllOffices(ENDPOINT);
    return allOffices;
  } catch (error) {
    console.error('Error fetching offices:', error);
    return [];
  }
};

export const getOffice = async (id: number): Promise<Office | null> => {
  try {
    // Assuming the single office endpoint returns the Office object directly within the data property
    const response: ApiResponse<Office> = await getResource<Office>(ENDPOINT, id);
    return response.data;
  } catch (error) {
    console.error('Error fetching office:', error);
    return null;
  }
};

export const createOffice = async (data: OfficeCreateInput): Promise<Office | null> => {
  try {
    // Assuming the create endpoint returns the newly created Office object within the data property
    const response: ApiResponse<Office> = await createResource<Office>(ENDPOINT, data);
    return response.data;
  } catch (error) {
    console.error('Error creating office:', error);
    return null;
  }
};

export const updateOffice = async (id: number, data: OfficeUpdateInput): Promise<Office | null> => {
  try {
    // Assuming the update endpoint returns the updated Office object within the data property
    const response: ApiResponse<Office> = await updateResource<Office>(ENDPOINT, id, data);
    return response.data;
  } catch (error) {
    console.error('Error updating office:', error);
    return null;
  }
};

export const deleteOffice = async (id: number): Promise<boolean> => {
  try {
    // Assuming deleteResource doesn't necessarily return data in the same way
    await deleteResource(ENDPOINT, id);
    return true;
  } catch (error) {
    console.error('Error deleting office:', error);
    return false;
  }
}; 