import { WorkTeam, WorkTeamCreateInput, WorkTeamUpdateInput } from '@/types/work-team';
import { getResource, createResource, updateResource, deleteResource } from './api';

const ENDPOINT = '/api/workTeams/';

export const getWorkTeams = async (): Promise<WorkTeam[]> => {
  try {
    const response = await getResource<WorkTeam[]>(ENDPOINT);
    return response.data;
  } catch (error) {
    return [];
  }
};

export const getWorkTeam = async (id: number): Promise<WorkTeam | null> => {
  try {
    const response = await getResource<WorkTeam>(ENDPOINT, id);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const createWorkTeam = async (data: WorkTeamCreateInput): Promise<WorkTeam | null> => {
  try {
    const response = await createResource<WorkTeam>(ENDPOINT, data);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const updateWorkTeam = async (id: number, data: WorkTeamUpdateInput): Promise<WorkTeam | null> => {
  try {
    const response = await updateResource<WorkTeam>(ENDPOINT, id, data);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const deleteWorkTeam = async (id: number): Promise<boolean> => {
  try {
    await deleteResource(ENDPOINT, id);
    return true;
  } catch (error) {
    return false;
  }
}; 