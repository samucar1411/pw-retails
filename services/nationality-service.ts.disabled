import { Nationality, NationalityCreateInput, NationalityUpdateInput } from '@/types/nationality';
import { getResource, createResource, updateResource, deleteResource } from './api';

const ENDPOINT = '/api/nationalitys/';

export const getNationalities = async (): Promise<Nationality[]> => {
  try {
    const response = await getResource<Nationality[]>(ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Error fetching nationalities:', error);
    return [];
  }
};

export const getNationality = async (id: number): Promise<Nationality | null> => {
  try {
    const response = await getResource<Nationality>(ENDPOINT, id);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const createNationality = async (data: NationalityCreateInput): Promise<Nationality | null> => {
  try {
    const response = await createResource<Nationality>(ENDPOINT, data);
    return response.data;
  } catch (error) {
    console.error('Error creating nationality:', error);
    return null;
  }
};

export const updateNationality = async (id: number, data: NationalityUpdateInput): Promise<Nationality | null> => {
  try {
    const response = await updateResource<Nationality>(ENDPOINT, id, data);
    return response.data;
  } catch (error) {
    console.error('Error updating nationality:', error);
    return null;
  }
};

export const deleteNationality = async (id: number): Promise<boolean> => {
  try {
    await deleteResource(ENDPOINT, id);
    return true;
  } catch (error) {
    console.error('Error deleting nationality:', error);
    return false;
  }
}; 