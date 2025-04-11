import { UserAdmin, UserAdminCreateInput, UserAdminUpdateInput } from '@/types/user-admin';
import { api } from './api';

export const userAdminService = {
  getUserAdmins: async (): Promise<UserAdmin[]> => {
    const response = await api.get('/api/useradmins/');
    return response.data;
  },

  getUserAdmin: async (id: number): Promise<UserAdmin> => {
    const response = await api.get(`/api/useradmins/${id}`);
    return response.data;
  },

  createUserAdmin: async (userAdminData: UserAdminCreateInput): Promise<UserAdmin> => {
    const response = await api.post('/api/useradmins/', userAdminData);
    return response.data;
  },

  updateUserAdmin: async (id: number, userAdminData: UserAdminUpdateInput): Promise<UserAdmin> => {
    const response = await api.patch(`/api/useradmins/${id}`, userAdminData);
    return response.data;
  },

  deleteUserAdmin: async (id: number): Promise<void> => {
    await api.delete(`/api/useradmins/${id}`);
  },
}; 