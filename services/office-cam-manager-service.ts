import { OfficeCamManager, OfficeCamManagerCreateInput, OfficeCamManagerUpdateInput } from '@/types/office-cam-manager';
import { api } from './api';

export const officeCamManagerService = {
  getOfficeCamManagers: async (): Promise<OfficeCamManager[]> => {
    const response = await api.get('/api/officeCamManagers/');
    return response.data;
  },

  getOfficeCamManager: async (id: number): Promise<OfficeCamManager> => {
    const response = await api.get(`/api/officeCamManagers/${id}`);
    return response.data;
  },

  createOfficeCamManager: async (data: OfficeCamManagerCreateInput): Promise<OfficeCamManager> => {
    const response = await api.post('/api/officeCamManagers/', data);
    return response.data;
  },

  updateOfficeCamManager: async (id: number, data: OfficeCamManagerUpdateInput): Promise<OfficeCamManager> => {
    const response = await api.patch(`/api/officeCamManagers/${id}`, data);
    return response.data;
  },

  deleteOfficeCamManager: async (id: number): Promise<void> => {
    await api.delete(`/api/officeCamManagers/${id}`);
  },
}; 