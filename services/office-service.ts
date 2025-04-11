import { Office, OfficeCreateInput, OfficeUpdateInput } from '@/types/office';
import { getResource, createResource, updateResource, deleteResource } from './api';

const ENDPOINT = '/api/offices/';

export const getOffices = async (): Promise<Office[]> => {
  try {
    const response = await getResource<Office[]>(ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Error fetching offices:', error);
    return [];
  }
};

export const getOffice = async (id: number): Promise<Office | null> => {
  try {
    const response = await getResource<Office>(ENDPOINT, id);
    return response.data;
  } catch (error) {
    console.error('Error fetching office:', error);
    return null;
  }
};

export const createOffice = async (data: OfficeCreateInput): Promise<Office | null> => {
  try {
    const response = await createResource<Office>(ENDPOINT, data);
    return response.data;
  } catch (error) {
    console.error('Error creating office:', error);
    return null;
  }
};

export const updateOffice = async (id: number, data: OfficeUpdateInput): Promise<Office | null> => {
  try {
    const response = await updateResource<Office>(ENDPOINT, id, data);
    return response.data;
  } catch (error) {
    console.error('Error updating office:', error);
    return null;
  }
};

export const deleteOffice = async (id: number): Promise<boolean> => {
  try {
    await deleteResource(ENDPOINT, id);
    return true;
  } catch (error) {
    console.error('Error deleting office:', error);
    return false;
  }
}; 