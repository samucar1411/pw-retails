import { Section, SectionCreateInput, SectionUpdateInput } from '@/types/section';
import { getResource, createResource, updateResource, deleteResource } from './api';

const ENDPOINT = '/api/sections';

export const getSections = async (): Promise<Section[]> => {
  try {
    const response = await getResource<Section[]>(ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Error fetching sections:', error);
    return [];
  }
};

export const getSection = async (id: number): Promise<Section | null> => {
  try {
    const response = await getResource<Section>(ENDPOINT, id);
    return response.data;
  } catch (error) {
    console.error('Error fetching section:', error);
    return null;
  }
};

export const createSection = async (data: SectionCreateInput): Promise<Section | null> => {
  try {
    const response = await createResource<Section>(ENDPOINT, data);
    return response.data;
  } catch (error) {
    console.error('Error creating section:', error);
    return null;
  }
};

export const updateSection = async (id: number, data: SectionUpdateInput): Promise<Section | null> => {
  try {
    const response = await updateResource<Section>(ENDPOINT, id, data);
    return response.data;
  } catch (error) {
    console.error('Error updating section:', error);
    return null;
  }
};

export const deleteSection = async (id: number): Promise<boolean> => {
  try {
    await deleteResource(ENDPOINT, id);
    return true;
  } catch (error) {
    console.error('Error deleting section:', error);
    return false;
  }
}; 